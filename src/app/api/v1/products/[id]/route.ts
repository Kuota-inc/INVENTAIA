import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { databaseErrorResponse, findKuotaParticipant, readJsonBody, requireKuotaWorkspace } from '@/lib/kuota/api';
import { formatAmountCents, isUuid, parseAmountCents } from '@/lib/kuota/domain';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: RouteContext<'/api/v1/products/[id]'>) {
  const limited = await rateLimit(request, { limit: 30, windowMs: 60_000, keyPrefix: 'kuota-products' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) return NextResponse.json({ success: false, error: 'Activa primero el perfil comprador.' }, { status: 409 });
    const { id } = await context.params;
    if (!isUuid(id)) return NextResponse.json({ success: false, error: 'Producto no válido.' }, { status: 400 });

    const body = await readJsonBody(request);
    if (!body || Object.keys(body).some((key) => !['name', 'price', 'isActive'].includes(key))) {
      return NextResponse.json({ success: false, error: 'Los campos permitidos son name, price e isActive.' }, { status: 400 });
    }
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ('name' in body) {
      if (typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.trim().length > 150) {
        return NextResponse.json({ success: false, error: 'El nombre debe tener entre 1 y 150 caracteres.' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }
    if ('price' in body) {
      const cents = parseAmountCents(body.price);
      if (cents === null) return NextResponse.json({ success: false, error: 'El precio debe ser positivo y tener hasta 2 decimales.' }, { status: 400 });
      updates.price = formatAmountCents(cents);
    }
    if ('isActive' in body) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ success: false, error: 'isActive debe ser booleano.' }, { status: 400 });
      updates.is_active = body.isActive;
    }
    if (Object.keys(updates).length === 1) return NextResponse.json({ success: false, error: 'Indica al menos un campo para actualizar.' }, { status: 400 });

    const { data, error } = await auth.ctx.supabase
      .from('kuota_products')
      .update(updates)
      .eq('id', id)
      .eq('buyer_id', buyer.id)
      .select('id,name,price,is_active,updated_at')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ success: false, error: 'Producto no encontrado.' }, { status: 404 });
    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    return databaseErrorResponse(error, 'PATCH /api/v1/products/[id]');
  }
}
