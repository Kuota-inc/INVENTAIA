import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import { readTwoFactorState } from '@/lib/twoFactorStore';
import { SessionManager } from '@/lib/session';

export const dynamic = 'force-dynamic';

type GoogleIdTokenInfo = {
  aud?: string;
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: string;
};

export async function GET() {
  const webClientId = process.env.GOOGLE_CLIENT_ID;
  if (!webClientId) {
    return NextResponse.json({ error: 'Google no está configurado.' }, { status: 503 });
  }

  return NextResponse.json(
    { webClientId },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(req, {
      limit: 10,
      windowMs: 60_000,
      keyPrefix: 'google-mobile-auth',
    });
    if (limited) return limited;

    const contentType = req.headers.get('content-type') || '';
    const expectsJson = contentType.includes('application/json');
    const body = contentType.includes('application/x-www-form-urlencoded')
      ? Object.fromEntries((await req.formData()).entries())
      : await req.json().catch(() => null);
    const idToken = typeof body?.idToken === 'string' ? body.idToken : '';
    if (!idToken || idToken.length > 8192) {
      return NextResponse.json({ error: 'Token de Google no válido.' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Google no está configurado.' }, { status: 503 });
    }

    const tokenInfoUrl = new URL('https://oauth2.googleapis.com/tokeninfo');
    tokenInfoUrl.searchParams.set('id_token', idToken);
    let googleResponse: Response;
    try {
      googleResponse = await fetch(tokenInfoUrl, { cache: 'no-store' });
    } catch (error) {
      console.error('No se pudo verificar el token nativo de Google:', error);
      return NextResponse.json({ error: 'No se pudo verificar la cuenta con Google.' }, { status: 502 });
    }

    if (!googleResponse.ok) {
      return NextResponse.json({ error: 'La autenticación de Google expiró. Inténtalo de nuevo.' }, { status: 401 });
    }

    const claims = (await googleResponse.json()) as GoogleIdTokenInfo;
    const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
    const expiresAt = Number(claims.exp);
    if (
      claims.aud !== clientId ||
      !['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss || '') ||
      !claims.sub ||
      !claims.email ||
      !emailVerified ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return NextResponse.json({ error: 'La autenticación de Google no es válida.' }, { status: 401 });
    }

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('*')
      .eq('email', claims.email)
      .maybeSingle();
    if (lookupError) throw new Error(`No se pudo consultar el usuario: ${lookupError.message}`);

    const userData = {
      name: claims.name || claims.email,
      email: claims.email,
      google_id: claims.sub,
      ...(claims.picture ? { avatar_url: claims.picture } : {}),
      updated_at: new Date().toISOString(),
    };

    let user = existingUser;
    if (existingUser) {
      const keepCustomAvatar = String(existingUser.avatar_url || '').startsWith('data:');
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          ...(keepCustomAvatar ? { avatar_url: existingUser.avatar_url } : {}),
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      if (error) throw new Error(`No se pudo actualizar el usuario: ${error.message}`);
      user = data;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert({ id: `usr-${Date.now()}`, ...userData })
        .select()
        .single();
      if (error) throw new Error(`No se pudo crear el usuario: ${error.message}`);
      user = data;
    }

    const { data: securityRow, error: securityError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (securityError) throw new Error(`No se pudo verificar la seguridad de la cuenta: ${securityError.message}`);

    let workspace: any = null;
    let role: 'OWNER' | 'ADMIN' | 'MEMBER' | null = null;
    if (user.workspace_id) {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', user.workspace_id)
        .maybeSingle();
      if (error) throw new Error(`No se pudo cargar el espacio de trabajo: ${error.message}`);
      workspace = data;
    }
    if (!workspace) {
      const { data: membership, error } = await supabase
        .from('workspace_users')
        .select('role, workspaces(*)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`No se pudo cargar el acceso al espacio de trabajo: ${error.message}`);
      const related = membership?.workspaces;
      workspace = Array.isArray(related) ? related[0] : related;
      role = membership?.role || null;
    }

    const twoFactor = readTwoFactorState(securityRow);
    if (twoFactor?.enabled) {
      const redirectTo = `/login/verify-2fa?callbackUrl=${workspace ? '/dashboard' : '/onboarding'}&flow=cookie`;
      if (expectsJson) {
        const response = NextResponse.json(
          { redirectTo, pendingTwoFactor: true },
          { headers: { 'Cache-Control': 'no-store' } }
        );
        await SessionManager.createPendingTwoFactor(user.id, user.email, response);
        return response;
      }
      const response = NextResponse.redirect(new URL(redirectTo, req.url), 303);
      await SessionManager.createPendingTwoFactor(user.id, user.email, response);
      return response;
    }

    const redirectTo = workspace ? '/dashboard' : '/onboarding';
    const response = expectsJson
      ? NextResponse.json({ redirectTo }, { headers: { 'Cache-Control': 'no-store' } })
      : NextResponse.redirect(new URL(redirectTo, req.url), 303);
    await SessionManager.createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      googleId: user.google_id,
      workspaceId: workspace?.id || null,
      workspaceSlug: workspace?.slug_url || null,
      workspaceName: workspace?.name || null,
      role,
    }, response);

    return response;
  } catch (error) {
    console.error('Error al iniciar sesión nativo con Google:', error);
    return NextResponse.json(
      { error: 'No se pudo iniciar sesión. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
