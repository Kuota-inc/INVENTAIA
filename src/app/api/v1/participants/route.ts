import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
  databaseErrorResponse,
  findKuotaParticipant,
  readJsonBody,
  requireKuotaWorkspace,
} from '@/lib/kuota/api';
import { makeKuotaQrPayload as createQrPayload } from '@/lib/kuota/domain';
import { parseKuotaBusinessProfile } from '@/lib/kuota/profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const participants = await findKuotaParticipant(auth.ctx);
    return NextResponse.json({
      success: true,
      participants: participants.map((participant) => ({
        ...participant,
        onboardingComplete: Boolean(
          participant.identity_document_type &&
          participant.identity_document_number &&
          participant.legal_name &&
          participant.address &&
          participant.phone
        ),
        ...(participant.role === 'SUPPLIER'
          ? { qrPayload: createQrPayload(participant.id) }
          : {}),
      })),
    });
  } catch (error) {
    return databaseErrorResponse(error, 'GET /api/v1/participants');
  }
}

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 5, windowMs: 60_000, keyPrefix: 'kuota-participants' });
  if (limited) return limited;

  try {
    const auth = await requireKuotaWorkspace();
    if (auth.error) return auth.error;
    const body = await readJsonBody(request);
    const role = body?.role;
    if (role !== 'BUYER' && role !== 'SUPPLIER') {
      return NextResponse.json({ success: false, error: 'El rol debe ser BUYER o SUPPLIER.' }, { status: 400 });
    }

    const profile = parseKuotaBusinessProfile(body);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Completa los datos del negocio e ingresa un DNI de 8 dígitos o RUC de 11 dígitos válido.' },
        { status: 400 }
      );
    }

    const profileFields = {
      identity_document_type: profile.identityDocumentType,
      identity_document_number: profile.identityDocumentNumber,
      legal_name: profile.legalName,
      address: profile.address,
      phone: profile.phone,
      display_name: profile.legalName,
    };
    const existing = await findKuotaParticipant(auth.ctx, role);
    if (existing) {
      const { data: participant, error } = await auth.ctx.supabase
        .from('kuota_participants')
        .update(profileFields)
        .eq('id', existing.id)
        .eq('workspace_id', auth.ctx.workspaceId)
        .eq('role', role)
        .select('id,workspace_id,role,display_name,reference_credit_percentage,identity_document_type,identity_document_number,legal_name,address,phone')
        .single();
      if (error) throw new Error(`No se pudo guardar el perfil del negocio: ${error.message}`);
      return NextResponse.json({
        success: true,
        participant,
        onboardingComplete: true,
        ...(role === 'SUPPLIER' ? { qrPayload: createQrPayload(existing.id) } : {}),
      });
    }

    const { data: participant, error } = await auth.ctx.supabase
      .from('kuota_participants')
      .insert({
        workspace_id: auth.ctx.workspaceId,
        created_by: auth.ctx.userId,
        role,
        ...profileFields,
        reference_credit_percentage: role === 'BUYER' ? 70 : null,
      })
      .select('id,workspace_id,role,display_name,reference_credit_percentage,identity_document_type,identity_document_number,legal_name,address,phone')
      .single();
    if (error?.code === '23505') {
      const created = await findKuotaParticipant(auth.ctx, role);
      if (created) {
        const { data: updated, error: updateError } = await auth.ctx.supabase
          .from('kuota_participants')
          .update(profileFields)
          .eq('id', created.id)
          .eq('workspace_id', auth.ctx.workspaceId)
          .eq('role', role)
          .select('id,workspace_id,role,display_name,reference_credit_percentage,identity_document_type,identity_document_number,legal_name,address,phone')
          .single();
        if (updateError) throw new Error(`No se pudo guardar el perfil del negocio: ${updateError.message}`);
        return NextResponse.json({
          success: true,
          participant: updated,
          onboardingComplete: true,
          ...(role === 'SUPPLIER' ? { qrPayload: createQrPayload(updated.id) } : {}),
        });
      }
    }
    if (error) throw new Error(`No se pudo crear el perfil Kuota: ${error.message}`);

    return NextResponse.json({
      success: true,
      participant,
      onboardingComplete: true,
      ...(role === 'SUPPLIER' ? { qrPayload: createQrPayload(participant.id) } : {}),
    }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse(error, 'POST /api/v1/participants');
  }
}
