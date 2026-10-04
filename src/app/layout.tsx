import '../app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KUOTA | Compras Inteligentes para Empresas',
  description:
    'Anticipa la demanda, evita quiebres de stock y financia inventario con inteligencia predictiva.',
  openGraph: {
    title: 'KUOTA — Compras Inteligentes para Empresas',
    description:
      'Anticipa la demanda, evita quiebres de stock y financia inventario con inteligencia predictiva.',
    type: 'website',
    locale: 'es_PE',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUOTA',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Compras Inteligentes para Empresas.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'PEN' },
  provider: { '@type': 'Organization', name: 'KUOTA Technologies Inc.' },
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
    // suppressHydrationWarning: el SSR siempre es light; el script puede
    // haber dejado dark antes de hidratar. Sin esto React emite warning.
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script id="inventa-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script id="inventa-org-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      </head>
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
