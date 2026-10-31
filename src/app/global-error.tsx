"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es-PE">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#CBE5FE', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#ffffff', padding: '32px 40px', borderRadius: '16px', border: '1px solid rgba(0, 35, 92, 0.15)', boxShadow: '0 8px 30px rgba(0, 35, 92, 0.08)', textAlign: 'center', maxWidth: '440px' }}>
          <h2 style={{ color: '#00235C', margin: '0 0 12px', fontSize: '20px', fontWeight: 700 }}>Algo salió mal</h2>
          <p style={{ color: '#2F7AEF', fontSize: '14px', margin: '0 0 24px', opacity: 0.85 }}>Hemos registrado el error automáticamente en Sentry para corregirlo.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              borderRadius: '9999px',
              background: '#0391FD',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(3, 145, 253, 0.3)'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
