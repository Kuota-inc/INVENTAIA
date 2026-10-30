import '../app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kuota — Financia tu crecimiento sin apuros | Compra mercadería a kuotas',
  description:
    'Compra a tus proveedores en cuotas semanales sin intereses abusivos o cobra con tarjeta con la comisión más baja del mercado.',
  openGraph: {
    title: 'Kuota — Financia tu crecimiento sin apuros',
    description:
      'Compra a tus proveedores en cuotas semanales sin intereses abusivos o cobra con tarjeta con la comisión más baja del mercado.',
    type: 'website',
    locale: 'es_PE',
    images: [{ url: '/logos/kuota-logo-light.png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/logos/kuota-icon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: [{ url: '/logos/kuota-icon.png', type: 'image/png' }],
    apple: [{ url: '/logos/kuota-icon.png', type: 'image/png' }],
  },
};

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Kuota',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Android, Web',
  description:
    'Financiamiento de inventario y aceptación de pagos para emprendedores.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PEN' },
  provider: { '@type': 'Organization', name: 'Kuota Technologies Inc.' },
};

// Corre ANTES del primer paint: lee la preferencia persistida y deja <html>
// en el tema correcto (atributo + clase). Default light, tolera storage bloqueado.
const THEME_INIT_SCRIPT = `!function(){try{var d=document.documentElement,k="inventa_theme",t=null;try{t=localStorage.getItem(k)}catch(e){}if(t!=="dark"&&t!=="light")t="light";d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark");d.style.colorScheme=t}catch(e){}}();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" type="image/png" href="/logos/kuota-icon.png" />
        <link rel="shortcut icon" type="image/png" href="/logos/kuota-icon.png" />
        <link rel="apple-touch-icon" href="/logos/kuota-icon.png" />
        <script
          id="inventa-theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <script
          id="inventa-org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
