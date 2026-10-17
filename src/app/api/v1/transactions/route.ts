import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { databaseErrorResponse, findKuotaParticipant, readJsonBody, requireKuotaWorkspace } from '@/lib/kuota/api';
import {
  isConfirmationWindowExpired,
  isUuid,
  isValidTermDays,
  parseAmountCents,
  formatAmountCents,
} from '@/lib/kuota/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const [buyer, supplier] = await Promise.all([
      findKuotaParticipant(auth.ctx, 'BUYER'),
      findKuotaParticipant(auth.ctx, 'SUPPLIER'),
    ]);
    if (!buyer && !supplier) return NextResponse.json({ success: true, transactions: [] });

    const queries = await Promise.all([
      buyer
        ? auth.ctx.supabase
            .from('kuota_transactions')
            .select('id,buyer_id,supplier_id,request_id,total_amount,payment_term_days,status,confirmation_timeout_at,created_at,supplier_accepted_at')
            .eq('buyer_id', buyer.id)
            .order('created_at', { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
      supplier
        ? auth.ctx.supabase
            .from('kuota_transactions')
            .select('id,buyer_id,supplier_id,request_id,total_amount,payment_term_days,status,confirmation_timeout_at,created_at,supplier_accepted_at')
            .eq('supplier_id', supplier.id)
            .order('created_at', { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const [buyerResult, supplierResult] = queries;
    if (buyerResult.error) throw new Error(buyerResult.error.message);
    if (supplierResult.error) throw new Error(supplierResult.error.message);

    const records = new Map(
      [...(buyerResult.data || []), ...(supplierResult.data || [])].map((item) => [item.id, item])
    );
    const transactions = [...records.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const ids = transactions.map((item) => item.id);
    const { data: events, error: eventsError } = ids.length
      ? await auth.ctx.supabase
          .from('kuota_transaction_events')
          .select('transaction_id,event_type,metadata,created_at')
          .in('transaction_id', ids)
          .order('created_at', { ascending: true })
      : { data: [], error: null };
    if (eventsError) throw new Error(eventsError.message);

    const timeline = new Map<string, typeof events>();
    for (const event of events || []) {
      const current = timeline.get(event.transaction_id) || [];
      current.push(event);
      timeline.set(event.transaction_id, current);
    }

    return NextResponse.json({
      success: true,
      fundsMoved: false,
      transactions: transactions.map((item) => ({
        ...item,
        confirmationWindowExpired: isConfirmationWindowExpired(item.confirmation_timeout_at),
        events: timeline.get(item.id) || [],
      })),
    });
  } catch (error) {
    return databaseErrorResponse(error, 'GET /api/v1/transactions');
  }
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 10, windowMs: 60_000, keyPrefix: 'kuota-transactions' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) return NextResponse.json({ success: false, error: 'Activa primero el perfil comprador.' }, { status: 409 });

    const body = await readJsonBody(request);
    const cents = parseAmountCents(body?.amount);
    if (
      cents === null ||
      !isUuid(body?.supplierId) ||
      !isUuid(body?.requestId) ||
      !isValidTermDays(body?.termDays)
    ) {
      return NextResponse.json(
        { success: false, error: 'Indica un proveedor QR, requestId UUID, monto positivo y plazo de 1 a 3650 días.' },
        { status: 400 }
      );
    }

    const { data: supplier, error: supplierError } = await auth.ctx.supabase
      .from('kuota_participants')
      .select('id')
      .eq('id', body.supplierId)
      .eq('role', 'SUPPLIER')
      .maybeSingle();
    if (supplierError) throw new Error(supplierError.message);
    if (!supplier) return NextResponse.json({ success: false, error: 'El QR no pertenece a un proveedor Kuota activo.' }, { status: 404 });
    if (supplier.id === buyer.id) return NextResponse.json({ success: false, error: 'No puedes crear una operación contigo mismo.' }, { status: 400 });

    const findRequest = () => auth.ctx.supabase
      .from('kuota_transactions')
      .select('id,buyer_id,supplier_id,request_id,total_amount,payment_term_days,status,confirmation_timeout_at,created_at')
      .eq('buyer_id', buyer.id)
      .eq('request_id', body.requestId as string)
      .maybeSingle();
    const existingResult = await findRequest();
    if (existingResult.error) throw new Error(existingResult.error.message);
    if (existingResult.data) {
      const sameRequest =
        existingResult.data.supplier_id === supplier.id &&
        parseAmountCents(existingResult.data.total_amount) === cents &&
        existingResult.data.payment_term_days === body.termDays;
      if (!sameRequest) return NextResponse.json({ success: false, error: 'requestId ya está asociado a otra operación.' }, { status: 409 });
      return NextResponse.json({ success: true, transaction: existingResult.data, fundsMoved: false, duplicate: true });
    }

    const { data: transaction, error } = await auth.ctx.supabase
      .from('kuota_transactions')
      .insert({
        buyer_id: buyer.id,
        supplier_id: supplier.id,
        request_id: body.requestId,
        total_amount: formatAmountCents(cents),
        payment_term_days: body.termDays,
        status: 'AWAITING_SUPPLIER_ACCEPTANCE',
        confirmation_timeout_at: new Date(Date.now() + 60_000).toISOString(),
        created_by: auth.ctx.userId,
      })
      .select('id,buyer_id,supplier_id,request_id,total_amount,payment_term_days,status,confirmation_timeout_at,created_at')
      .single();

    if (error?.code === '23505') {
      const duplicate = await findRequest();
      if (duplicate.error) throw new Error(duplicate.error.message);
      if (duplicate.data) {
        const sameRequest =
          duplicate.data.supplier_id === supplier.id &&
          parseAmountCents(duplicate.data.total_amount) === cents &&
          duplicate.data.payment_term_days === body.termDays;
        if (!sameRequest) return NextResponse.json({ success: false, error: 'requestId ya está asociado a otra operación.' }, { status: 409 });
        return NextResponse.json({ success: true, transaction: duplicate.data, fundsMoved: false, duplicate: true });
      }
    }
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, transaction, fundsMoved: false, duplicate: false }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, 'POST /api/v1/transactions');
  }
}
