'use client';

import React, { useState, useMemo } from 'react';
import {
  PackageMinus, ArrowRight, Search, AlertCircle, TrendingDown,
  DollarSign, Sparkles, Filter, ChevronRight, Tag
} from 'lucide-react';
import Link from 'next/link';

type DeadStockItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  daysInactive: number;
  physicalStock: number;
  unitCost: number;
  totalTiedCapital: number;
  impactLevel: 'alto' | 'medio' | 'bajo';
};

const MOCK_DEAD_STOCK: DeadStockItem[] = [
  { id: 'ds-1', sku: 'ALC-005', name: 'Margarina Manty 500g', category: 'Alimentos', daysInactive: 112, physicalStock: 240, unitCost: 3.8, totalTiedCapital: 912, impactLevel: 'alto' },
  { id: 'ds-2', sku: 'PG-004', name: 'Gillette Prestobarba x 5', category: 'Higiene', daysInactive: 85, physicalStock: 320, unitCost: 3.5, totalTiedCapital: 1120, impactLevel: 'alto' },
  { id: 'ds-3', sku: 'NST-004', name: 'Kit Kat 4 Fingers 41.5g', category: 'Alimentos', daysInactive: 64, physicalStock: 180, unitCost: 3.2, totalTiedCapital: 576, impactLevel: 'medio' },
  { id: 'ds-4', sku: 'PG-003', name: 'Head & Shoulders 400ml', category: 'Higiene', daysInactive: 45, physicalStock: 120, unitCost: 13.0, totalTiedCapital: 1560, impactLevel: 'medio' },
  { id: 'ds-5', sku: 'ALC-004', name: 'Galletas Casino Chocolate', category: 'Alimentos', daysInactive: 32, physicalStock: 450, unitCost: 1.6, totalTiedCapital: 720, impactLevel: 'bajo' },
];

export default function InventarioInmovilizadoPage() {
  const [search, setSearch] = useState('');
  const [filterDays, setFilterDays] = useState<'todos' | '30' | '60' | '90'>('todos');

  const fmt = (v: number) => `S/ ${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const filtered = useMemo(() => {
    return MOCK_DEAD_STOCK.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
      const matchDays =
        filterDays === 'todos' ? true :
        filterDays === '30' ? item.daysInactive >= 30 :
        filterDays === '60' ? item.daysInactive >= 60 :
        item.daysInactive >= 90;
      return matchSearch && matchDays;
    }).sort((a, b) => b.totalTiedCapital - a.totalTiedCapital);
  }, [search, filterDays]);

  const totalCapital = MOCK_DEAD_STOCK.reduce((acc, curr) => acc + curr.totalTiedCapital, 0);
  const criticalCapital = MOCK_DEAD_STOCK.filter(i => i.daysInactive >= 90).reduce((a, c) => a + c.totalTiedCapital, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#fef3c7', color: '#92400e' }}>
              <PackageMinus size={12} /> INVENTARIO & FINANZAS
            </span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
              Optimización de Capital
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Inventario Inmovilizado
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            Capital estancado en productos sin movimiento. Libera liquidez aplicando descuentos o liquidaciones.
          </p>
        </div>
        <Link href="/financiamiento" className="wise-btn-primary flex items-center gap-2">
          Financiamiento para Capital <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="wise-card-dark !p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--color-paper)' }}>Capital Estancado</p>
            <p className="text-4xl font-black mt-1" style={{ color: 'var(--color-lime-voltage)', fontFamily: 'var(--font-wise-sans)' }}>
              {fmt(totalCapital)}
            </p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-paper)' }}>Total en {MOCK_DEAD_STOCK.length} SKUs</p>
          </div>
        </div>

        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Riesgo Crítico (&gt;90d)</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-alarm-red)', fontFamily: 'var(--font-wise-sans)' }}>
            {fmt(criticalCapital)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Capital en alto riesgo de pérdida</p>
        </div>

        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>SKUs Críticos</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {MOCK_DEAD_STOCK.filter(i => i.daysInactive >= 90).length}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Sin ventas en 3 meses</p>
        </div>

        <div className="wise-card !p-5" style={{ background: 'var(--color-linen-mist)', borderColor: 'var(--color-linen-mist)' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>Estrategia IA</p>
          <p className="text-sm font-bold mt-2 leading-tight" style={{ color: 'var(--color-spruce)' }}>
            Liquidar Gillette y Margarina Manty recuperaría S/ 2,032 de liquidez inmediata.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="wise-segmented">
          <button className={filterDays === 'todos' ? 'active' : ''} onClick={() => setFilterDays('todos')}>Todos</button>
          <button className={filterDays === '30' ? 'active' : ''} onClick={() => setFilterDays('30')}>+30 Días</button>
          <button className={filterDays === '60' ? 'active' : ''} onClick={() => setFilterDays('60')}>+60 Días</button>
          <button className={filterDays === '90' ? 'active' : ''} onClick={() => setFilterDays('90')}>+90 Días Crítico</button>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
          <input
            type="search" placeholder="Buscar SKU o nombre..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="wise-input pl-9 !py-2 !text-sm w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="wise-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--color-fog)' }}>
              <tr className="text-xs font-bold uppercase tracking-wider border-b border-[var(--color-fog)]" style={{ color: 'var(--color-slate)' }}>
                <th className="px-5 py-3">SKU / Producto</th>
                <th className="px-5 py-3 text-center">Días Inactivo</th>
                <th className="px-5 py-3 text-right">Stock Físico</th>
                <th className="px-5 py-3 text-right">Costo Unit.</th>
                <th className="px-5 py-3 text-right">Capital Retenido</th>
                <th className="px-5 py-3 text-center">Acción Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-fog)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--color-pebble)] font-medium">
                    No se encontró inventario inmovilizado con estos filtros.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--color-fog)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono text-[10px]" style={{ color: 'var(--color-pebble)' }}>{item.sku}</div>
                      <div className="font-bold leading-tight" style={{ color: 'var(--color-obsidian)' }}>{item.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{item.category}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-black text-sm" style={{ color: item.daysInactive >= 90 ? 'var(--color-alarm-red)' : item.daysInactive >= 60 ? '#c2410c' : 'var(--color-spruce)' }}>
                        {item.daysInactive} d
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[var(--color-obsidian)]">
                      {item.physicalStock} u.
                    </td>
                    <td className="px-5 py-4 text-right text-[var(--color-pebble)]">
                      S/ {item.unitCost.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-black" style={{ color: item.impactLevel === 'alto' ? 'var(--color-alarm-red)' : 'var(--color-obsidian)' }}>
                        {fmt(item.totalTiedCapital)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {item.daysInactive >= 60 ? (
                        <button className="wise-btn-outline !text-xs !py-1.5 !px-3 !border-[var(--color-alarm-red)] !text-[var(--color-alarm-red)] hover:!bg-[#fee2e2] flex items-center gap-1.5 mx-auto">
                          <Tag size={12} /> Liquidar (20% OFF)
                        </button>
                      ) : (
                        <button className="wise-btn-outline !text-xs !py-1.5 !px-3 flex items-center gap-1.5 mx-auto">
                          <TrendingDown size={12} /> Promocionar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
