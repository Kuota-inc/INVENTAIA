-- ============================================================================
-- KUOTA v1.0 — INITIAL DATABASE DDL & SEED SCRIPT
-- Factoring de inventarios vía QR para Pymes
-- Soporta Enclave Financiero Aislado (kuota_financial) y Core (kuota_core)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS kuota_core;
CREATE SCHEMA IF NOT EXISTS kuota_financial;

-- ============================================================================
-- 1. ESQUEMA CORE (kuota_core)
-- ============================================================================

-- Tabla de Usuarios (Compradores y Proveedores)
CREATE TABLE IF NOT EXISTS kuota_core.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni_ruc VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('BUYER', 'SUPPLIER', 'ADMIN')),
    phone VARCHAR(20) NOT NULL UNIQUE,
    legal_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seguridad: PIN Hasheado con BCrypt(12) y Bloqueo de Fuerza Bruta
CREATE TABLE IF NOT EXISTS kuota_core.user_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES kuota_core.users(id) ON DELETE CASCADE,
    pin_hash VARCHAR(255) NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo de Productos de Referencia (Comprador)
CREATE TABLE IF NOT EXISTS kuota_core.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES kuota_core.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_buyer ON kuota_core.products (buyer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_buyer_price ON kuota_core.products (buyer_id, price) WHERE is_active = TRUE;

-- Ventas Interceptadas por el Listener Móvil (Yape / Plin)
-- Nota de Privacidad Estricta: NO se almacena nombre ni teléfono del pagador.
CREATE TABLE IF NOT EXISTS kuota_core.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES kuota_core.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source_app VARCHAR(50) NOT NULL, -- 'YAPE', 'PLIN'
    status VARCHAR(30) NOT NULL CHECK (status IN ('COMPROBADA', 'NO_COMPROBADA')),
    matched_product_id UUID REFERENCES kuota_core.products(id) ON DELETE SET NULL,
    raw_checksum VARCHAR(64), -- SHA-256 para deduplicación idempotente
    detected_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_buyer_status ON kuota_core.sales (buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_detected ON kuota_core.sales (buyer_id, detected_at DESC);

-- Transacciones de Financiamiento Orquestadas por QR
CREATE TABLE IF NOT EXISTS kuota_core.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(32) NOT NULL UNIQUE,
    buyer_id UUID NOT NULL REFERENCES kuota_core.users(id),
    supplier_id UUID NOT NULL REFERENCES kuota_core.users(id),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    down_payment_amount NUMERIC(12, 2) NOT NULL CHECK (down_payment_amount >= 0),
    financed_amount NUMERIC(12, 2) NOT NULL CHECK (financed_amount > 0),
    payment_term_days INT NOT NULL CHECK (payment_term_days > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED'
        CHECK (status IN ('INITIATED', 'AWAITING_SUPPLIER_CONFIRMATION', 'CONFIRMED_SUCCESSFUL', 'PENDING_CONFIRMATION_TIMEOUT', 'CANCELLED')),
    confirmation_timeout_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_buyer ON kuota_core.transactions (buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_tx_supplier ON kuota_core.transactions (supplier_id, status);

-- Cuentas por Pagar (Comprador)
CREATE TABLE IF NOT EXISTS kuota_core.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES kuota_core.transactions(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES kuota_core.users(id),
    total_financed NUMERIC(12, 2) NOT NULL,
    remaining_balance NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID', 'OVERDUE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ap_buyer ON kuota_core.accounts_payable (buyer_id, status);

-- Cuentas por Cobrar (Proveedor)
CREATE TABLE IF NOT EXISTS kuota_core.accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE REFERENCES kuota_core.transactions(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES kuota_core.users(id),
    total_sale_amount NUMERIC(12, 2) NOT NULL,
    down_payment_received NUMERIC(12, 2) NOT NULL DEFAULT 0,
    kuota_pending_disbursement NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_FINAL_SETTLEMENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ENCLAVE FINANCIERO AISLADO (kuota_financial)
-- Cumple con Sección 8.1 del PRD: Servicios que mueven dinero aislados
-- ============================================================================

CREATE TABLE IF NOT EXISTS kuota_financial.payout_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL UNIQUE,
    supplier_id UUID NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    destination_channel VARCHAR(50) NOT NULL, -- 'INTERBANK_CCI', 'YAPE_BUSINESS', 'PLIN'
    destination_account_encrypted TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED'
        CHECK (status IN ('CREATED', 'QUEUED', 'PROCESSING', 'SETTLED', 'FAILED')),
    external_bank_tx_id VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_supplier ON kuota_financial.payout_orders (supplier_id, status);

-- ============================================================================
-- 3. DATOS SEMILLA PARA TESTING Y DEMO LOCAL
-- ============================================================================

-- Comprador Demo: Bodega Don Pepe
INSERT INTO kuota_core.users (id, dni_ruc, role, phone, legal_name, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '10458796',
    'BUYER',
    '+51987654321',
    'Bodega Don Pepe S.A.C.',
    NOW()
) ON CONFLICT (dni_ruc) DO NOTHING;

-- PIN Hasheado de Don Pepe: '123456'
-- Hash BCrypt estándar para '123456': $2a$12$e8yQ9F1Zg3OqL3lE7YQyqeP8xN3.y8bC7V3E5G8R2G6mK7p8wXb4G
INSERT INTO kuota_core.user_security (id, user_id, pin_hash, failed_attempts, locked_until, updated_at)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '$2a$12$e8yQ9F1Zg3OqL3lE7YQyqeP8xN3.y8bC7V3E5G8R2G6mK7p8wXb4G',
    0,
    NULL,
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Proveedor Demo: Distribuidora Alicorp
INSERT INTO kuota_core.users (id, dni_ruc, role, phone, legal_name, created_at)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    '20100055237',
    'SUPPLIER',
    '+51999888777',
    'Alicorp Distribución Central',
    NOW()
) ON CONFLICT (dni_ruc) DO NOTHING;

-- Catálogo de Productos de Don Pepe
INSERT INTO kuota_core.products (id, buyer_id, name, price, is_active)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Aceite Primor Premium 1L', 11.90, true),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Arroz Costeño Extra 5kg', 24.50, true),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Leche Gloria Azul 400g', 4.20, true),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Azúcar Rubia Cartavio 1kg', 4.80, true),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Detergente Opal 800g', 8.50, true)
ON CONFLICT (id) DO NOTHING;

-- Ventas Interceptadas Pre-cargadas (Ventas comprobadas suman ~S/ 7,142.85 para dar ~S/ 5,000 en línea de crédito al 70%)
INSERT INTO kuota_core.sales (buyer_id, amount, source_app, status, matched_product_id, detected_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 24.50, 'YAPE', 'COMPROBADA', 'c0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 hours'),
    ('a0000000-0000-0000-0000-000000000001', 11.90, 'YAPE', 'COMPROBADA', 'c0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 hours'),
    ('a0000000-0000-0000-0000-000000000001', 4.20,  'PLIN', 'COMPROBADA', 'c0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 hours'),
    ('a0000000-0000-0000-0000-000000000001', 24.50, 'YAPE', 'COMPROBADA', 'c0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '6 hours'),
    ('a0000000-0000-0000-0000-000000000001', 7080.00, 'YAPE', 'COMPROBADA', NULL, NOW() - INTERVAL '1 day'),
    ('a0000000-0000-0000-0000-000000000001', 100.00, 'YAPE', 'NO_COMPROBADA', NULL, NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;
