'use client';

import React from 'react';
import { QrCode, Store, ShoppingBag, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './AccessLanding.module.css';

export function KuotaNetworkMotif() {
  return (
    <div className={styles.motif} aria-hidden="true">
      <svg className={styles.motifSvg} viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradients */}
          <linearGradient id="kuotaPathGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0391FD" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#0391FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00235C" stopOpacity="0.2" />
          </linearGradient>

          <radialGradient id="kuotaPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0391FD" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0391FD" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="260" cy="140" r="110" fill="url(#kuotaPulse)" />

        {/* Connection Paths */}
        {/* Left (Proveedor) to Center (Kuota) */}
        <path
          d="M 110 140 C 180 140, 190 140, 260 140"
          stroke="url(#kuotaPathGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        {/* Center (Kuota) to Right (Comprador) */}
        <path
          d="M 260 140 C 330 140, 340 140, 410 140"
          stroke="url(#kuotaPathGrad)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        {/* Curved connection from Top to Center */}
        <path
          d="M 180 60 C 210 100, 230 120, 260 140"
          stroke="rgba(0, 35, 92, 0.15)"
          strokeWidth="1.5"
        />
        {/* Curved connection from Bottom to Center */}
        <path
          d="M 340 220 C 310 180, 290 160, 260 140"
          stroke="rgba(0, 35, 92, 0.15)"
          strokeWidth="1.5"
        />

        {/* ----------------- NODO 1: PROVEEDOR (IZQUIERDA) ----------------- */}
        <g transform="translate(60, 95)">
          <rect width="90" height="90" rx="14" fill="#ffffff" stroke="rgba(0, 35, 92, 0.15)" strokeWidth="1.5" />
          <rect x="22" y="16" width="46" height="46" rx="10" fill="#f0f7ff" />
          <foreignObject x="33" y="27" width="24" height="24">
            <Store size={24} color="#00235C" />
          </foreignObject>
          <text x="45" y="76" textAnchor="middle" fill="#00235C" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            PROVEEDOR
          </text>
        </g>

        {/* ----------------- NODO 2: KUOTA ENGINE (CENTRO) ----------------- */}
        <g transform="translate(215, 90)">
          <rect width="100" height="100" rx="20" fill="#00235C" />
          <rect x="25" y="18" width="50" height="50" rx="10" fill="rgba(3, 145, 253, 0.2)" />
          <foreignObject x="38" y="30" width="26" height="26">
            <QrCode size={26} color="#ffffff" />
          </foreignObject>
          <text x="50" y="80" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.05em">
            KUOTA
          </text>
        </g>

        {/* ----------------- NODO 3: COMPRADOR / BODEGA (DERECHA) ----------------- */}
        <g transform="translate(370, 95)">
          <rect width="90" height="90" rx="14" fill="#ffffff" stroke="rgba(0, 35, 92, 0.15)" strokeWidth="1.5" />
          <rect x="22" y="16" width="46" height="46" rx="10" fill="#f0f7ff" />
          <foreignObject x="33" y="27" width="24" height="24">
            <ShoppingBag size={24} color="#0391FD" />
          </foreignObject>
          <text x="45" y="76" textAnchor="middle" fill="#00235C" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            BODEGA
          </text>
        </g>

        {/* ----------------- FLOATING STATUS PILLS ----------------- */}
        {/* Pill 1: Línea disponible */}
        <g transform="translate(290, 42)">
          <rect width="175" height="28" rx="14" fill="#4ade80" />
          <circle cx="16" cy="14" r="5" fill="#00235C" />
          <text x="28" y="18" fill="#00235C" fontSize="10" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.04em">
            LÍNEA: S/ 5,000 DISPONIBLE
          </text>
        </g>

        {/* Pill 2: Tarifa única */}
        <g transform="translate(50, 42)">
          <rect width="145" height="28" rx="14" fill="#ffffff" stroke="rgba(0, 35, 92, 0.15)" strokeWidth="1" />
          <text x="72" y="18" textAnchor="middle" fill="#00235C" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            5% COBRO ÚNICO
          </text>
        </g>

        {/* Pill 3: Pagos Semanales */}
        <g transform="translate(195, 215)">
          <rect width="150" height="28" rx="14" fill="#ffffff" stroke="rgba(0, 35, 92, 0.15)" strokeWidth="1" />
          <text x="75" y="18" textAnchor="middle" fill="#0391FD" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            PAGOS SEMANALES
          </text>
        </g>
      </svg>
    </div>
  );
}
