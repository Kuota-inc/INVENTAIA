-- Kuota MVP persistence for the authenticated Next.js API.
-- Run in Supabase Dashboard > SQL Editor before calling /api/v1 routes; safe to re-run.
-- No payout, payin, loan-interest, or custody operation is created here.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.kuota_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('BUYER', 'SUPPLIER')),
    display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 255),
    identity_document_type TEXT,
    identity_document_number TEXT,
    legal_name TEXT,
    address TEXT,
    phone TEXT,
    reference_credit_percentage NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kuota_participant_workspace_role UNIQUE (workspace_id, role),
    CONSTRAINT kuota_buyer_credit_percentage CHECK (
        (role = 'BUYER' AND reference_credit_percentage IS NOT NULL
            AND reference_credit_percentage BETWEEN 0 AND 100)
        OR (role = 'SUPPLIER' AND reference_credit_percentage IS NULL)
    )
);

-- Additive for installations that already applied an earlier version of this script.
ALTER TABLE public.kuota_participants
    ADD COLUMN IF NOT EXISTS identity_document_type TEXT,
    ADD COLUMN IF NOT EXISTS identity_document_number TEXT,
    ADD COLUMN IF NOT EXISTS legal_name TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'kuota_participant_business_profile_consistency'
          AND conrelid = 'public.kuota_participants'::regclass
    ) THEN
        ALTER TABLE public.kuota_participants
        ADD CONSTRAINT kuota_participant_business_profile_consistency CHECK (
            (
                identity_document_type IS NULL
                AND identity_document_number IS NULL
                AND legal_name IS NULL
                AND address IS NULL
                AND phone IS NULL
            )
            OR (
                identity_document_type IS NOT NULL
                AND identity_document_number IS NOT NULL
                AND legal_name IS NOT NULL
                AND address IS NOT NULL
                AND phone IS NOT NULL
                AND
                (
                    identity_document_type = 'DNI'
                    AND identity_document_number ~ '^[0-9]{8}$'
                )
                OR (
                    identity_document_type = 'RUC'
                    AND identity_document_number ~ '^[0-9]{11}$'
                )
            )
            AND length(trim(legal_name)) BETWEEN 1 AND 255
            AND length(trim(address)) BETWEEN 1 AND 250
            AND phone ~ '^\+?[0-9]{7,15}$'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.kuota_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.kuota_participants(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 150),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS kuota_products_buyer_active_price
    ON public.kuota_products (buyer_id, price) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.kuota_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.kuota_participants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source_app TEXT NOT NULL CHECK (source_app IN ('YAPE', 'PLIN')),
    status TEXT NOT NULL CHECK (status IN ('COMPROBADA', 'NO_COMPROBADA')),
    matched_product_id UUID REFERENCES public.kuota_products(id) ON DELETE SET NULL,
    raw_checksum VARCHAR(64) NOT NULL CHECK (raw_checksum ~ '^[0-9a-fA-F]{64}$'),
    detected_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kuota_sales_idempotency UNIQUE (buyer_id, raw_checksum)
);
CREATE INDEX IF NOT EXISTS kuota_sales_buyer_detected
    ON public.kuota_sales (buyer_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS kuota_sales_buyer_verified
    ON public.kuota_sales (buyer_id, status) WHERE status = 'COMPROBADA';

CREATE TABLE IF NOT EXISTS public.kuota_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.kuota_participants(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES public.kuota_participants(id) ON DELETE RESTRICT,
    request_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    payment_term_days INTEGER NOT NULL CHECK (payment_term_days BETWEEN 1 AND 3650),
    status TEXT NOT NULL DEFAULT 'AWAITING_SUPPLIER_ACCEPTANCE'
        CHECK (status IN ('AWAITING_SUPPLIER_ACCEPTANCE', 'SUPPLIER_ACCEPTED')),
    confirmation_timeout_at TIMESTAMPTZ NOT NULL,
    created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    supplier_accepted_by TEXT REFERENCES public.users(id) ON DELETE RESTRICT,
    supplier_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT kuota_transaction_request_idempotency UNIQUE (buyer_id, request_id),
    CONSTRAINT kuota_transaction_acceptance_consistency CHECK (
        (status = 'SUPPLIER_ACCEPTED'
            AND supplier_accepted_by IS NOT NULL
            AND supplier_accepted_at IS NOT NULL)
        OR (status = 'AWAITING_SUPPLIER_ACCEPTANCE'
            AND supplier_accepted_by IS NULL
            AND supplier_accepted_at IS NULL)
    )
);
CREATE INDEX IF NOT EXISTS kuota_transactions_buyer_created
    ON public.kuota_transactions (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS kuota_transactions_supplier_status
    ON public.kuota_transactions (supplier_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.kuota_transaction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.kuota_transactions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('REQUESTED', 'SUPPLIER_ACCEPTED')),
    actor_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS kuota_transaction_events_timeline
    ON public.kuota_transaction_events (transaction_id, created_at);

CREATE OR REPLACE FUNCTION public.kuota_audit_transaction_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.kuota_transaction_events (transaction_id, event_type, actor_user_id, metadata)
        VALUES (NEW.id, 'REQUESTED', NEW.created_by, jsonb_build_object('status', NEW.status));
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.kuota_transaction_events (transaction_id, event_type, actor_user_id, metadata)
        VALUES (
            NEW.id,
            'SUPPLIER_ACCEPTED',
            NEW.supplier_accepted_by,
            jsonb_build_object('previous_status', OLD.status, 'status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kuota_transaction_state_audit ON public.kuota_transactions;
CREATE TRIGGER kuota_transaction_state_audit
    AFTER INSERT OR UPDATE ON public.kuota_transactions
    FOR EACH ROW EXECUTE FUNCTION public.kuota_audit_transaction_state();

CREATE OR REPLACE FUNCTION public.kuota_buyer_credit_summary(p_buyer_id UUID)
RETURNS TABLE (verified_sales_base NUMERIC, available_credit NUMERIC)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT
        COALESCE(SUM(s.amount), 0)::NUMERIC,
        ROUND(
            COALESCE(SUM(s.amount), 0) * p.reference_credit_percentage / 100,
            2
        )::NUMERIC
    FROM public.kuota_participants AS p
    LEFT JOIN public.kuota_sales AS s
        ON s.buyer_id = p.id AND s.status = 'COMPROBADA'
    WHERE p.id = p_buyer_id AND p.role = 'BUYER'
    GROUP BY p.id, p.reference_credit_percentage;
$$;

ALTER TABLE public.kuota_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_transaction_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    public.kuota_participants,
    public.kuota_products,
    public.kuota_sales,
    public.kuota_transactions,
    public.kuota_transaction_events
FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE
    public.kuota_participants,
    public.kuota_products,
    public.kuota_sales,
    public.kuota_transactions,
    public.kuota_transaction_events
TO service_role;

REVOKE ALL ON FUNCTION public.kuota_audit_transaction_state() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.kuota_buyer_credit_summary(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kuota_audit_transaction_state() TO service_role;
GRANT EXECUTE ON FUNCTION public.kuota_buyer_credit_summary(UUID) TO service_role;

-- Verification: these must report RLS enabled and direct roles denied.
SELECT
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_select,
    has_table_privilege('authenticated', c.oid, 'SELECT') AS authenticated_can_select
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname LIKE 'kuota_%'
  AND c.relkind = 'r'
ORDER BY c.relname;
