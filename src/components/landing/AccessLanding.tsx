'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { KuotaNetworkMotif } from './KuotaNetworkMotif';
import styles from './AccessLanding.module.css';

export interface AccessFooterLink {
  href: string;
  label: string;
}

interface AccessLandingProps {
  /** Tagline mono junto al isotipo, p. ej. "Financiamiento y pagos". */
  tagline: string;
  /** Titular grande del panel de marca. */
  headline: React.ReactNode;
  /** Párrafo bajo el titular. */
  description: React.ReactNode;
  /** Rail de módulos o capacidades en mayúsculas mono. */
  capabilities: string[];
  /** Slot superior derecho (selector de idioma, ayuda, …). */
  topbar?: React.ReactNode;
  /** Eyebrow mono sobre el título ("Plataforma de operaciones"). */
  eyebrow: string;
  /** Tiñe el eyebrow de error cuando hay alerta visible. */
  eyebrowError?: boolean;
  /** Título de la tarjeta ("Iniciar sesión"). */
  title: string;
  /** Subtítulo de la tarjeta. */
  subtitle: React.ReactNode;
  /** Alerta opcional entre el subtítulo y el cuerpo. */
  alert?: React.ReactNode;
  /** Cuerpo de la tarjeta (botones, divisores, …). */
  children: React.ReactNode;
  /** Línea legal bajo el cuerpo (términos, prueba gratis, …). */
  footerNote?: React.ReactNode;
  /** Texto inferior izquierdo ("Kuota Technologies"). */
  footerLeft: string;
  footerLinks: AccessFooterLink[];
  /** Variante clara del landing. */
  light?: boolean;
  /** Rellena el alto restante cuando vive bajo una cabecera. */
  fill?: boolean;
}

/**
 * Pantalla de acceso de dos columnas adaptada al Sistema de Diseño Kuota (DESIGN.md):
 * Canvas Pale Sky a la izquierda con motivo fintech abstracto y tarjeta White a la derecha.
 */
export function AccessLanding({
  tagline,
  headline,
  description,
  capabilities,
  topbar,
  eyebrow,
  eyebrowError = false,
  title,
  subtitle,
  alert,
  children,
  footerNote,
  footerLeft,
  footerLinks,
  light = true,
  fill = false,
}: AccessLandingProps) {
  const pageClass = [styles.page, fill ? styles.pageFill : ''].filter(Boolean).join(' ');

  return (
    <div className={pageClass}>
      {/* ------------------------------------------- PANEL DE MARCA (IZQ) */}
      <aside className={styles.brandSide}>
        <div className={styles.brandMark}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <Logo height={28} />
          </Link>
          <span className={styles.brandRule} aria-hidden="true" />
          <span className={styles.tagline}>{tagline}</span>
        </div>

        <KuotaNetworkMotif />

        <div className={styles.brandCopy}>
          <h2 className={styles.brandH2}>{headline}</h2>
          <p className={styles.brandP}>{description}</p>
          <div className={styles.brandRail}>
            {capabilities.map((capability) => (
              <span key={capability} className={styles.brandRailTag}>
                {capability}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* --------------------------------------------- PANEL DE ACCESO (DER) */}
      <main className={styles.formSide}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Volver a Kuota</span>
          </Link>

          <div>{topbar}</div>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.card}>
            <div className={eyebrowError ? `${styles.eyebrow} ${styles.eyebrowError}` : styles.eyebrow}>
              {eyebrow}
            </div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>

            {alert}

            {children}

            {footerNote && <p className={styles.aside}>{footerNote}</p>}
          </div>
        </div>

        <div className={styles.footer}>
          <span>{footerLeft}</span>
          <span className={styles.footerLinks}>
            {footerLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className={styles.footerLink}>
                {link.label}
              </Link>
            ))}
          </span>
        </div>
      </main>
    </div>
  );
}

export default AccessLanding;
