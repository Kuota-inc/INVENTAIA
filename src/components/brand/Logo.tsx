import React from 'react';
import { KuotaLogo } from './KuotaLogo';

export interface LogoProps {
  variant?: 'full' | 'mark' | 'wordmark';
  height?: number;
  className?: string;
  title?: string;
}

export function Logo({ variant = 'full', height = 32, className = '' }: LogoProps) {
  return <KuotaLogo variant={variant} height={height} className={className} />;
}

export default Logo;
