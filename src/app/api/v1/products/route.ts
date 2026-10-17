import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { databaseErrorResponse, findKuotaParticipant, readJsonBody, requireKuotaWorkspace } from '@/lib/kuota/api';
import { formatAmountCents, parseAmountCents } from '@/lib/kuota/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) return NextResponse.json({ success: true, products: [] });

    const { data, error } = await auth.ctx.supabase
      .from('kuota_products')
      .select('id,name,price,is_active,created_at,updated_at')
      .eq('buyer_id', buyer.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, products: data });
  } catch (error) {
    return databaseErrorResponse(error, 'GET /api/v1/products');
  }
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 30, windowMs: 60_000, keyPrefix: 'kuota-products' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) return NextResponse.json({ success: false, error: 'Activa primero el perfil comprador.' }, { status: 409 });

    const body = await readJsonBody(request);
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const cents = parseAmountCents(body?.price);
    if (name.length < 1 || name.length > 150 || cents === null) {
      return NextResponse.json(
        { success: false, error: 'Indica un nombre de hasta 150 caracteres y un precio positivo con hasta 2 decimales.' },
        { status: 400 }
      );
    }

    const { data, error } = await auth.ctx.supabase
      .from('kuota_products')
      .insert({
        buyer_id: buyer.id,
        created_by: auth.ctx.userId,
        name,
        price: formatAmountCents(cents),
      })
      .select('id,name,price,is_active,created_at')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, product: data }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, 'POST /api/v1/products');
  }
}
