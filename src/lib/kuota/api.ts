import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { authOptions } from '@/lib/auth';
import { SessionManager } from '@/lib/session';

export type KuotaRole = 'BUYER' | 'SUPPLIER';
export type KuotaClient = Awaited<ReturnType<typeof createClient>>;

export interface KuotaContext {
  supabase: KuotaClient;
  workspaceId: string;
  userId: string;
}

export interface KuotaParticipant {
  id: string;
  workspace_id: string;
  role: KuotaRole;
  display_name: string;
  reference_credit_percentage: number | null;
  identity_document_type: 'DNI' | 'RUC' | null;
  identity_document_number: string | null;
  legal_name: string | null;
  address: string | null;
  phone: string | null;
}

export type KuotaContextResult =
  | { ctx: KuotaContext; error?: never }
  | { ctx?: never; error: NextResponse };

export async function requireKuotaWorkspace(): Promise<KuotaContextResult> {
  const session = await SessionManager.getSession();
  const nextAuth = session?.userId && session.workspaceId
    ? null
    : await getServerSession(authOptions).catch(() => null);
  const nextUser = nextAuth?.user as
    | { id?: string; workspace_id?: string }
    | undefined;
  const userId = session?.userId || nextUser?.id;
  const workspaceId =
    session?.workspaceId && session.workspaceId !== 'ws-default'
      ? session.workspaceId
      : nextUser?.workspace_id;

  if (!userId || !workspaceId) {
    return {
      error: NextResponse.json(
        { success: false, error: 'No tienes un espacio de trabajo activo.' },
        { status: 401 }
      ),
    };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error: NextResponse.json(
        { success: false, error: 'La API de Kuota requiere configurar el acceso seguro a la base de datos.' },
        { status: 503 }
      ),
    };
  }

  const supabase = await createClient();
  const [userResult, membershipResult] = await Promise.all([
    supabase.from('users').select('workspace_id').eq('id', userId).maybeSingle(),
    supabase
      .from('workspace_users')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .maybeSingle(),
  ]);
  if (userResult.error) throw new Error(`No se pudo validar el usuario: ${userResult.error.message}`);
  if (membershipResult.error) throw new Error(`No se pudo validar el espacio de trabajo: ${membershipResult.error.message}`);

  if (userResult.data?.workspace_id !== workspaceId && !membershipResult.data) {
    return {
      error: NextResponse.json(
        { success: false, error: 'No tienes acceso a este espacio de trabajo.' },
        { status: 403 }
      ),
    };
  }

  return { ctx: { supabase, workspaceId, userId } };
}

export function findKuotaParticipant(ctx: KuotaContext, role: KuotaRole): Promise<KuotaParticipant | null>;
export function findKuotaParticipant(ctx: KuotaContext): Promise<KuotaParticipant[]>;
export async function findKuotaParticipant(
  ctx: KuotaContext,
  role?: KuotaRole
): Promise<KuotaParticipant | KuotaParticipant[] | null> {
  let query = ctx.supabase
    .from('kuota_participants')
    .select('id,workspace_id,role,display_name,reference_credit_percentage,identity_document_type,identity_document_number,legal_name,address,phone')
    .eq('workspace_id', ctx.workspaceId);
  if (role) query = query.eq('role', role);

  const { data, error } = await query;
  if (error) throw new Error(`No se pudo cargar el perfil Kuota: ${error.message}`);
  return role
    ? (data?.[0] as KuotaParticipant | undefined) || null
    : (data || []) as KuotaParticipant[];
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text();
  if (text.length > 8192) return null;
  try {
    const body: unknown = JSON.parse(text);
    return body !== null && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function databaseErrorResponse(error: unknown, route: string) {
  console.error(`Error en ${route}:`, error);
  return NextResponse.json(
    { success: false, error: 'No se pudo completar la operación de Kuota.' },
    { status: 500 }
  );
}
