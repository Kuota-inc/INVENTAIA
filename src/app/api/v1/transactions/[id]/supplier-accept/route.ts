import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { databaseErrorResponse, findKuotaParticipant, requireKuotaWorkspace } from '@/lib/kuota/api';
import { isUuid } from '@/lib/kuota/domain';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: RouteContext<'/api/v1/transactions/[id]/supplier-accept'>
) {
  const limited = await rateLimit(request, { limit: 10, windowMs: 60_000, keyPrefix: 'kuota-transaction-accept' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const supplier = await findKuotaParticipant(auth.ctx, 'SUPPLIER');
    if (!supplier) return NextResponse.json({ success: false, error: 'Activa primero el perfil proveedor.' }, { status: 409 });
    const { id } = await context.params;
    if (!isUuid(id)) return NextResponse.json({ success: false, error: 'Transacción no válida.' }, { status: 400 });

    const { data: transaction, error } = await auth.ctx.supabase
      .from('kuota_transactions')
      .update({
        status: 'SUPPLIER_ACCEPTED',
        supplier_accepted_by: auth.ctx.userId,
        supplier_accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('supplier_id', supplier.id)
      .eq('status', 'AWAITING_SUPPLIER_ACCEPTANCE')
      .select('id,status,supplier_accepted_at,confirmation_timeout_at')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (transaction) {
      return NextResponse.json({ success: true, transaction, fundsMoved: false });
    }

    const { data: existing, error: lookupError } = await auth.ctx.supabase
      .from('kuota_transactions')
      .select('id,status,supplier_accepted_at,confirmation_timeout_at')
      .eq('id', id)
      .eq('supplier_id', supplier.id)
      .maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (!existing) return NextResponse.json({ success: false, error: 'Transacción no encontrada.' }, { status: 404 });
    if (existing.status === 'SUPPLIER_ACCEPTED') {
      return NextResponse.json({ success: true, transaction: existing, fundsMoved: false, duplicate: true });
    }
    return NextResponse.json({ success: false, error: 'La transacción ya no puede aceptarse.' }, { status: 409 });
  } catch (error) {
    return databaseErrorResponse(error, 'POST /api/v1/transactions/[id]/supplier-accept');
  }
}
