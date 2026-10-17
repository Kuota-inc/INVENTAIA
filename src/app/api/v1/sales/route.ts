import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { databaseErrorResponse, findKuotaParticipant, readJsonBody, requireKuotaWorkspace } from '@/lib/kuota/api';
import {
  formatAmountCents,
  isSha256,
  normalizeDetectedAt,
  parseAmountCents,
  presentKuotaSale,
} from '@/lib/kuota/domain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) {
      return NextResponse.json({
        success: true,
        sales: [],
        matchedNotificationAmount: '0.00',
        referenceEstimate: '0.00',
        verifiedSalesBase: '0.00',
        availableCredit: '0.00',
        creditIsReferenceOnly: true,
        verificationMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
        matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
        paymentProviderVerified: false,
      });
    }

    const [{ data: sales, error: salesError }, { data: summary, error: summaryError }] = await Promise.all([
      auth.ctx.supabase
        .from('kuota_sales')
        .select('id,amount,source_app,status,matched_product_id,detected_at,created_at')
        .eq('buyer_id', buyer.id)
        .order('detected_at', { ascending: false })
        .limit(100),
      auth.ctx.supabase.rpc('kuota_buyer_credit_summary', { p_buyer_id: buyer.id }),
    ]);
    if (salesError) throw new Error(salesError.message);
    if (summaryError) throw new Error(summaryError.message);
    const totals = Array.isArray(summary) ? summary[0] : null;
    return NextResponse.json({
      success: true,
      sales: (sales || []).map(presentKuotaSale),
      verificationMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
      matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
      paymentProviderVerified: false,
      matchedNotificationAmount: String(totals?.verified_sales_base ?? '0.00'),
      referenceEstimate: String(totals?.available_credit ?? '0.00'),
      // Keep existing keys for older Android clients; these are not verified sales or approved credit.
      verifiedSalesBase: String(totals?.verified_sales_base ?? '0.00'),
      availableCredit: String(totals?.available_credit ?? '0.00'),
      referenceCreditPercentage: Number(buyer.reference_credit_percentage),
      creditIsReferenceOnly: true,
    });
  } catch (error) {
    return databaseErrorResponse(error, 'GET /api/v1/sales');
  }
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 120, windowMs: 60_000, keyPrefix: 'kuota-sales' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const buyer = await findKuotaParticipant(auth.ctx, 'BUYER');
    if (!buyer) return NextResponse.json({ success: false, error: 'Activa primero el perfil comprador.' }, { status: 409 });

    const body = await readJsonBody(request);
    const cents = parseAmountCents(body?.amount);
    const detectedAt = normalizeDetectedAt(body?.detectedAt);
    const sourceApp = body?.sourceApp;
    if (
      cents === null ||
      !detectedAt ||
      (sourceApp !== 'YAPE' && sourceApp !== 'PLIN') ||
      !isSha256(body?.checksum)
    ) {
      return NextResponse.json(
        { success: false, error: 'Notificación inválida: monto, fecha, origen o checksum no válido.' },
        { status: 400 }
      );
    }

    const amount = formatAmountCents(cents);
    const { data: product, error: productError } = await auth.ctx.supabase
      .from('kuota_products')
      .select('id')
      .eq('buyer_id', buyer.id)
      .eq('price', amount)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (productError) throw new Error(productError.message);

    const saleInput = {
      buyer_id: buyer.id,
      amount,
      source_app: sourceApp,
      status: product ? 'COMPROBADA' : 'NO_COMPROBADA',
      matched_product_id: product?.id || null,
      raw_checksum: body.checksum.toLowerCase(),
      detected_at: detectedAt,
    };
    const { data, error } = await auth.ctx.supabase
      .from('kuota_sales')
      .insert(saleInput)
      .select('id,amount,source_app,status,matched_product_id,detected_at,created_at')
      .maybeSingle();

    if (error?.code === '23505') {
      const { data: existing, error: lookupError } = await auth.ctx.supabase
        .from('kuota_sales')
        .select('id,amount,source_app,status,matched_product_id,detected_at,created_at')
        .eq('buyer_id', buyer.id)
        .eq('raw_checksum', saleInput.raw_checksum)
        .maybeSingle();
      if (lookupError) throw new Error(lookupError.message);
      if (existing) {
        const isSameEvent =
          parseAmountCents(existing.amount) === cents &&
          existing.source_app === sourceApp &&
          new Date(existing.detected_at).getTime() === new Date(detectedAt).getTime();
        if (!isSameEvent) {
          return NextResponse.json({ success: false, error: 'El checksum ya pertenece a otra notificación.' }, { status: 409 });
        }
        return NextResponse.json({
          success: true,
          sale: presentKuotaSale(existing),
          duplicate: true,
          verificationMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
          matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
          paymentProviderVerified: false,
        });
      }
    }
    if (error) throw new Error(error.message);
    if (!data) throw new Error('La venta no devolvió un registro después de guardarse.');
    return NextResponse.json({
      success: true,
      sale: presentKuotaSale(data),
      duplicate: false,
      verificationMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
      matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
      paymentProviderVerified: false,
    }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, 'POST /api/v1/sales');
  }
}
