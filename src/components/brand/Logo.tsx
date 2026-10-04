import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  /** `full`: logo completo (K + KUOTA) · `mark`: solo isotipo K (sidebar colapsado) */
  variant?: 'full' | 'mark';
  /** Alto en px. El prompt pide height between 32px and 40px para el Navbar. */
  height?: number;
  className?: string;
  title?: string;
}

/**
 * Logotipo oficial KUOTA.
 * Single source of truth usando los assets extraídos del archivo subido.
 */
export function Logo({ variant = 'full', height = 36, className = '', title = 'KUOTA' }: LogoProps) {
  // Ajustamos el ratio aproximado según los recortes que hicimos:
  // logo-navbar (full): ~500x150 -> aspect ratio ~ 3.33
  // icon (mark): ~120x150 -> aspect ratio ~ 0.8

  if (variant === 'mark') {
    return (
      <img
        src="/kuota-logo-new.png"
        alt={title}
        height={height}
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
        className={className}
      />
    );
  }

  return (
    <img
      src="/kuota-logo-new.png"
      alt={title}
      height={height}
      style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
      className={className}
    />
  );
}

export default Logo;

