'use client';

import React, { useState, useMemo } from 'react';
import {
  Coins, ArrowRight, Wallet, Target, TrendingUp, AlertCircle, Calendar
} from 'lucide-react';
import Link from 'next/link';

type CapitalItem = {
  id: string;
  sku: string;
  name: string;
  requiredCapital: number;
  urgencyDays: number;
  expectedROI: number; // %
};

const MOCK_CAPITAL: CapitalItem[] = [
  { id: 'c-1', sku: 'ALC-001', name: 'Aceite Primor Premium 1L', requiredCapital: 2460, urgencyDays: 2, expectedROI: 45.0 },
  { id: 'c-2', sku: 'NST-001', name: 'Milo Actigen-E 400g', requiredCapital: 5400, urgencyDays: 4, expectedROI: 41.9 },
  { id: 'c-3', sku: 'PG-001', name: 'Ariel Líquido Doble Poder 2L', requiredCapital: 3168, urgencyDays: 6, expectedROI: 36.9 },
  { id: 'c-4', sku: 'NST-002', name: 'Nescafé Tradición 200g', requiredCapital: 4608, urgencyDays: 8, expectedROI: 38.2 },
  { id: 'c-5', sku: 'ALC-003', name: 'Fideos Don Vittorio 500g', requiredCapital: 1728, urgencyDays: 14, expectedROI: 35.7 },
  { id: 'c-6', sku: 'PG-002', name: 'Pampers Recién Nacido x 40', requiredCapital: 2220, urgencyDays: 10, expectedROI: 32.6 },
];

export default function CapitalRequeridoPage() {
  const fmt = (v: number) => `S/ ${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const totalRequired = MOCK_CAPITAL.reduce((acc, curr) => acc + curr.requiredCapital, 0);
  const immediateRequired = MOCK_CAPITAL.filter(i => i.urgencyDays <= 7).reduce((acc, curr) => acc + curr.requiredCapital, 0);
  const avgROI = MOCK_CAPITAL.reduce((acc, curr) => acc + curr.expectedROI, 0) / MOCK_CAPITAL.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <Coins size={12} /> PROYECCIÓN FINANCIERA
            </span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
              Horizonte: Próximos 14 Días
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Capital de Trabajo Requerido
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            Proyección del capital necesario para cubrir tu plan de reabastecimiento y evitar quiebres de stock.
          </p>
        </div>
        <Link href="/financiamiento" className="wise-btn-primary flex items-center gap-2">
          Ver Línea de Crédito KUOTA <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="wise-card-dark !p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} /></div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--color-paper)' }}>Capital Total (14d)</p>
            <p className="text-4xl font-black mt-1" style={{ color: 'var(--color-lime-voltage)', fontFamily: 'var(--font-wise-sans)' }}>
              {fmt(totalRequired)}
            </p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-paper)' }}>Para {MOCK_CAPITAL.length} SKUs prioritarios</p>
          </div>
        </div>

        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Necesidad Inmediata (7d)</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-alarm-red)', fontFamily: 'var(--font-wise-sans)' }}>
            {fmt(immediateRequired)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Capital crítico a desembolsar</p>
        </div>

        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>ROI Promedio</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {avgROI.toFixed(1)}%
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Retorno esperado sobre costo</p>
        </div>

        <div className="wise-card !p-5" style={{ background: 'var(--color-linen-mist)', borderColor: 'var(--color-linen-mist)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>Brecha de Caja</p>
          <p className="text-sm font-bold mt-2 leading-tight" style={{ color: 'var(--color-spruce)' }}>
            Tienes un desfase de <strong>{fmt(immediateRequired - 2000)}</strong> para cubrir las necesidades de esta semana.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="wise-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-fog)] flex items-center justify-between" style={{ background: 'var(--color-fog)' }}>
          <h3 className="font-bold" style={{ color: 'var(--color-obsidian)' }}>Desglose de Capital por Producto</h3>
          <span className="wise-badge !text-xs !px-3 !py-1" style={{ background: 'var(--color-forest-ink)', color: 'var(--color-lime-voltage)' }}>
            IA Priorizada
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider border-b border-[var(--color-fog)]" style={{ color: 'var(--color-slate)' }}>
                <th className="px-6 py-3">SKU / Producto</th>
                <th className="px-6 py-3 text-center">Días de Urgencia</th>
                <th className="px-6 py-3 text-right">Capital Requerido</th>
                <th className="px-6 py-3 text-right">ROI Esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-fog)]">
              {MOCK_CAPITAL.map(item => (
                <tr key={item.id} className="hover:bg-[var(--color-fog)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-[10px]" style={{ color: 'var(--color-pebble)' }}>{item.sku}</div>
                    <div className="font-bold leading-tight mt-0.5" style={{ color: 'var(--color-obsidian)' }}>{item.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                      style={
                        item.urgencyDays <= 3 ? { background: '#fee2e2', color: 'var(--color-alarm-red)' } :
                        item.urgencyDays <= 7 ? { background: '#fff7ed', color: '#c2410c' } :
                        { background: 'var(--color-fog)', color: 'var(--color-spruce)' }
                      }
                    >
                      <Calendar size={12} /> {item.urgencyDays} días
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-[var(--color-obsidian)]">
                    {fmt(item.requiredCapital)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold" style={{ color: item.expectedROI >= 40 ? 'var(--color-spruce)' : 'var(--color-charcoal)' }}>
                      {item.expectedROI}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
