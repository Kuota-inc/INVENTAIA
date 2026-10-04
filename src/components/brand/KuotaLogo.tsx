import React from 'react';

export interface KuotaLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'mark' | 'wordmark';
  height?: number;
}

export function KuotaLogo({ variant = 'full', height = 32, className = '', ...props }: KuotaLogoProps) {
  const primary = '#1F5E45';
  const secondary = '#8FD694';

  const mark = (
    <svg viewBox="0 0 100 100" height={height} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Left stem */}
      <rect x="15" y="15" width="22" height="70" rx="4" fill={primary} />
      {/* Top diagonal with hidden curve */}
      <path d="M40 55 C 40 55, 65 15, 85 15 C 90 15, 93 20, 88 25 C 65 50, 50 65, 50 65 Z" fill={secondary} />
      {/* Bottom diagonal */}
      <path d="M35 55 L 75 88 C 80 92, 88 88, 85 82 L 48 50 Z" fill={primary} />
    </svg>
  );

  const wordmark = (
    <svg viewBox="0 0 300 100" height={height} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="0" y="75" fontFamily="var(--font-wise-sans, system-ui)" fontWeight="900" fontSize="72" fill={primary} letterSpacing="-0.04em">
        KUOTA
      </text>
    </svg>
  );

  const full = (
    <svg viewBox="0 0 420 100" height={height} className={className} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(0, 0)">
        <rect x="15" y="15" width="22" height="70" rx="4" fill={primary} />
        <path d="M40 55 C 40 55, 65 15, 85 15 C 90 15, 93 20, 88 25 C 65 50, 50 65, 50 65 Z" fill={secondary} />
        <path d="M35 55 L 75 88 C 80 92, 88 88, 85 82 L 48 50 Z" fill={primary} />
      </g>
      <text x="110" y="75" fontFamily="var(--font-wise-sans, system-ui)" fontWeight="900" fontSize="72" fill={primary} letterSpacing="-0.04em">
        KUOTA
      </text>
    </svg>
  );

  if (variant === 'mark') return mark;
  if (variant === 'wordmark') return wordmark;
  return full;
}
