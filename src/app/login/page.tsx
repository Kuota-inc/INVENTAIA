'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { AccessLanding } from '@/components/landing/AccessLanding';
import { GoogleMark } from '@/components/landing/GoogleMark';
import landingStyles from '@/components/landing/AccessLanding.module.css';

// Diccionario empresarial de traducción de errores OAuth y NextAuth
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'El acceso fue denegado. Por favor, autoriza los permisos de Google.',
  Configuration: 'Error de configuración en el servidor. Contacta a soporte.',
  Verification: 'El token de verificación ha expirado o ya fue utilizado.',
  OAuthSignin: 'Hubo un problema al conectar con Google. Inténtalo de nuevo.',
  OAuthCallback: 'Hubo un problema al iniciar sesión con Google. Inténtalo de nuevo.',
  OAuthCreateAccount: 'No se pudo crear la cuenta con este proveedor.',
  EmailCreateAccount: 'No se pudo crear la cuenta con el correo proporcionado.',
  Callback: 'Error durante la redirección de autenticación. Inténtalo de nuevo.',
  OAuthAccountNotLinked: 'Este correo ya está registrado con otro método de acceso.',
  Default: 'Hubo un problema al iniciar sesión con Google. Inténtalo de nuevo.',
};

const CAPABILITIES = [
  'Inventario',
  'Pronóstico',
  'Reabastecimiento',
  'Financiamiento',
  'Analítica',
];

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoginStep, setGoogleLoginStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nativeGoogleInitialized = useRef(false);

  // 1. Intercepción y limpieza inmediata de URL (?error=)
  useEffect(() => {
    const error = searchParams?.get('error');
    if (error) {
      setErrorMessage(AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.Default);

      // Limpieza estricta e inmediata de la barra de direcciones para evitar persistencia al recargar
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/login');
      }
    }
  }, [searchParams]);

  // 2. Manejo de inicio de sesión real con Google OAuth 2.0 y prevención de múltiples clics
  const handleGoogleLogin = async () => {
    if (loading) return; // Prevención de doble clic
    try {
      setLoading(true);
      setErrorMessage(null);

      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        setGoogleLoginStep('Conectando con KUOTA…');
        const configResponse = await withTimeout(
          fetch('/api/auth/google/mobile', { cache: 'no-store' }),
          15000,
          'No se pudo conectar con KUOTA. Revisa tu conexión e inténtalo de nuevo.',
        );
        const config = await configResponse.json();
        if (!configResponse.ok || typeof config.webClientId !== 'string') {
          throw new Error(config.error || AUTH_ERROR_MESSAGES.Default);
        }

        if (!nativeGoogleInitialized.current) {
          setGoogleLoginStep('Preparando inicio de sesión seguro…');
          await withTimeout(
            SocialLogin.initialize({
              google: { webClientId: config.webClientId, mode: 'online' },
            }),
            20000,
            'No se pudo preparar el inicio de sesión de Google. Cierra y vuelve a abrir la app.',
          );
          nativeGoogleInitialized.current = true;
        }

        setGoogleLoginStep('Esperando respuesta de Google…');
        const { result } = await withTimeout(
          SocialLogin.login({ provider: 'google', options: {} }),
          90000,
          'Google no respondió. Comprueba que haya una cuenta Google en el teléfono e inténtalo de nuevo.',
        );
        if (result.responseType !== 'online' || !result.idToken) {
          throw new Error(AUTH_ERROR_MESSAGES.Default);
        }

        setGoogleLoginStep('Verificando tu cuenta…');
        const authResponse = await withTimeout(
          fetch('/api/auth/google/mobile', {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: result.idToken }),
          }),
          30000,
          'KUOTA tardó demasiado en verificar tu cuenta. Inténtalo de nuevo.',
        );
        const authResult = await authResponse.json();
        if (!authResponse.ok || typeof authResult.redirectTo !== 'string') {
          throw new Error(authResult.error || AUTH_ERROR_MESSAGES.Default);
        }

        if (authResult.pendingTwoFactor) {
          window.location.replace(authResult.redirectTo);
          return;
        }

        const sessionResponse = await withTimeout(
          fetch('/api/session', { credentials: 'include', cache: 'no-store' }),
          15000,
          'La cuenta se verificó, pero KUOTA no pudo confirmar la sesión en este teléfono.',
        );
        const session = await sessionResponse.json();
        if (!sessionResponse.ok || !session.authenticated) {
          throw new Error(
            'Google verificó tu cuenta, pero el teléfono no guardó la sesión. Cierra completamente la app y vuelve a intentarlo.',
          );
        }

        window.location.replace(authResult.redirectTo);
        return;
      }

      const targetUrl = searchParams?.get('callbackUrl') || '/dashboard';
      await signIn('google', { callbackUrl: targetUrl });
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      setErrorMessage(err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.Default);
      setLoading(false);
      setGoogleLoginStep(null);
    }
  };

  return (
    <AccessLanding
      tagline="Inventario, pronóstico, reabastecimiento y finanzas"
      headline="Gestione todo el inventario, no solo el almacén."
      description="KUOTA conecta inventario, pronóstico, órdenes de compra y financiamiento en cada sucursal y proveedor. Un único registro en vivo, desde la orden de compra hasta el cobro."
      capabilities={CAPABILITIES}
      topbar={
        <Link href="/ayuda/guia" className={landingStyles.pill}>
          <HelpIcon />
          Centro de ayuda
        </Link>
      }
      eyebrow="Plataforma de operaciones"
      eyebrowError={errorMessage !== null}
      title="Iniciar sesión"
      subtitle="Use su cuenta de KUOTA. El acceso depende de su empresa y su rol."
      alert={
        errorMessage ? (
          <div className={landingStyles.alert} role="alert" aria-live="assertive">
            <svg className={landingStyles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className={landingStyles.alertBody}>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className={landingStyles.alertClose}
              aria-label="Cerrar alerta"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : undefined
      }
      footerNote={
        <>
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className={landingStyles.asideLink}>
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className={landingStyles.asideLink}>
            Política de Privacidad
          </Link>
          .
        </>
      }
      footerLeft="KUOTA Operaciones"
      footerLinks={[
        { href: '/ayuda/guia', label: 'Ayuda' },
        { href: '/ayuda/soporte', label: 'Soporte' },
      ]}
    >
      <div className={landingStyles.divider} aria-hidden="true">
        <span className={landingStyles.dividerRule} />
        <span className={landingStyles.dividerText}>Inicie sesión con</span>
        <span className={landingStyles.dividerRule} />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className={landingStyles.idp}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <svg className={landingStyles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>{googleLoginStep ?? 'Conectando con Google…'}</span>
          </>
        ) : (
          <>
            <GoogleMark />
            <span>Google</span>
          </>
        )}
      </button>
    </AccessLanding>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={landingStyles.formWrap} style={{ minHeight: '100dvh' }} />}>
      <LoginContent />
    </Suspense>
  );
}
