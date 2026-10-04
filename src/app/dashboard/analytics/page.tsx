'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Search, SlidersHorizontal,
  ArrowUpRight, ArrowDownRight, Package, DollarSign, Star,
  ChevronUp, ChevronDown, Sparkles, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type SKU = {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  margin: number;        // %
  unitsSold30d: number;
  revenue30d: number;
  profit30d: number;
  rotation: number;      // vueltas/mes
  stockValue: number;
  trend: 'up' | 'down' | 'flat';
  trendPct: number;
  recommendation: 'potenciar' | 'mantener' | 'revisar' | 'liquidar';
};

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_SKUS: SKU[] = [
  { id: 's1', sku: 'ALC-001', name: 'Aceite Primor Premium 1L', category: 'Alimentos',
    costPrice: 8.2, salePrice: 14.9, margin: 45.0, unitsSold30d: 180, revenue30d: 2682, profit30d: 1206,
    rotation: 6.8, stockValue: 1148, trend: 'up', trendPct: 12, recommendation: 'potenciar' },
  { id: 's2', sku: 'NST-001', name: 'Milo Actigen-E 400g', category: 'Alimentos',
    costPrice: 9.0, salePrice: 15.5, margin: 41.9, unitsSold30d: 360, revenue30d: 5580, profit30d: 2340,
    rotation: 8.2, stockValue: 432, trend: 'up', trendPct: 8, recommendation: 'potenciar' },
  { id: 's3', sku: 'NST-002', name: 'Nescafé Tradición 200g', category: 'Alimentos',
    costPrice: 16.0, salePrice: 25.9, margin: 38.2, unitsSold30d: 135, revenue30d: 3497, profit30d: 1336,
    rotation: 5.2, stockValue: 576, trend: 'up', trendPct: 5, recommendation: 'potenciar' },
  { id: 's4', sku: 'PG-001', name: 'Ariel Líquido Doble Poder 2L', category: 'Higiene',
    costPrice: 22.0, salePrice: 34.9, margin: 36.9, unitsSold30d: 120, revenue30d: 4188, profit30d: 1548,
    rotation: 3.8, stockValue: 528, trend: 'flat', trendPct: 0, recommendation: 'mantener' },
  { id: 's5', sku: 'ALC-003', name: 'Fideos Don Vittorio Spaghetti 500g', category: 'Alimentos',
    costPrice: 2.7, salePrice: 4.2, margin: 35.7, unitsSold30d: 258, revenue30d: 1084, profit30d: 387,
    rotation: 7.1, stockValue: 324, trend: 'flat', trendPct: -2, recommendation: 'mantener' },
  { id: 's6', sku: 'NST-005', name: 'Leche Gloria Evaporada 400g', category: 'Alimentos',
    costPrice: 4.8, salePrice: 7.3, margin: 34.2, unitsSold30d: 180, revenue30d: 1314, profit30d: 450,
    rotation: 9.5, stockValue: 86, trend: 'down', trendPct: -6, recommendation: 'mantener' },
  { id: 's7', sku: 'PG-002', name: 'Pampers Recién Nacido x 40', category: 'Higiene',
    costPrice: 37.0, salePrice: 54.9, margin: 32.6, unitsSold30d: 96, revenue30d: 5270, profit30d: 1718,
    rotation: 2.9, stockValue: 1184, trend: 'down', trendPct: -4, recommendation: 'mantener' },
  { id: 's8', sku: 'PG-003', name: 'Head & Shoulders Anti-Caspa 400ml', category: 'Higiene',
    costPrice: 13.0, salePrice: 18.9, margin: 31.2, unitsSold30d: 72, revenue30d: 1361, profit30d: 425,
    rotation: 2.1, stockValue: 624, trend: 'down', trendPct: -11, recommendation: 'revisar' },
  { id: 's9', sku: 'ALC-004', name: 'Galletas Casino Chocolate', category: 'Alimentos',
    costPrice: 1.6, salePrice: 2.2, margin: 27.3, unitsSold30d: 192, revenue30d: 422, profit30d: 115,
    rotation: 5.5, stockValue: 115, trend: 'down', trendPct: -18, recommendation: 'revisar' },
  { id: 's10', sku: 'PG-004', name: 'Gillette Prestobarba x 5', category: 'Higiene',
    costPrice: 3.5, salePrice: 4.5, margin: 22.2, unitsSold30d: 48, revenue30d: 216, profit30d: 48,
    rotation: 1.2, stockValue: 280, trend: 'down', trendPct: -25, recommendation: 'liquidar' },
  { id: 's11', sku: 'ALC-005', name: 'Margarina Manty 500g', category: 'Alimentos',
    costPrice: 3.8, salePrice: 4.9, margin: 22.4, unitsSold30d: 36, revenue30d: 176, profit30d: 40,
    rotation: 0.8, stockValue: 228, trend: 'down', trendPct: -30, recommendation: 'liquidar' },
  { id: 's12', sku: 'NST-004', name: 'Kit Kat 4 Fingers 41.5g', category: 'Alimentos',
    costPrice: 3.2, salePrice: 4.0, margin: 20.0, unitsSold30d: 24, revenue30d: 96, profit30d: 19,
    rotation: 0.5, stockValue: 192, trend: 'down', trendPct: -40, recommendation: 'liquidar' },
];

const REC_CONFIG = {
  potenciar: { label: 'Potenciar',  bg: 'var(--color-linen-mist)', color: 'var(--color-spruce)', dot: '#16a34a' },
  mantener:  { label: 'Mantener',   bg: 'var(--color-fog)',         color: 'var(--color-charcoal)', dot: '#6b7280' },
  revisar:   { label: 'Revisar',    bg: '#fff7ed',                   color: '#c2410c',               dot: '#f97316' },
  liquidar:  { label: 'Liquidar',   bg: '#fee2e2',                   color: 'var(--color-alarm-red)', dot: '#ef4444' },
};

type SortKey = 'margin' | 'profit30d' | 'revenue30d' | 'rotation' | 'trendPct';

export default function RentabilidadSKUPage() {
  const [search, setSearch] = useState('');
  const [recFilter, setRecFilter] = useState<'todos' | SKU['recommendation']>('todos');
  const [sortKey, setSortKey] = useState<SortKey>('profit30d');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fmt = (v: number) => `S/ ${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() =>
    MOCK_SKUS
      .filter(s =>
        (recFilter === 'todos' || s.recommendation === recFilter) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        const mult = sortDir === 'desc' ? -1 : 1;
        return mult * (a[sortKey] - b[sortKey]);
      }),
    [search, recFilter, sortKey, sortDir]
  );

  const totalRevenue = MOCK_SKUS.reduce((a, s) => a + s.revenue30d, 0);
  const totalProfit  = MOCK_SKUS.reduce((a, s) => a + s.profit30d, 0);
  const avgMargin    = MOCK_SKUS.reduce((a, s) => a + s.margin, 0) / MOCK_SKUS.length;
  const topSKU       = [...MOCK_SKUS].sort((a, b) => b.profit30d - a.profit30d)[0];

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1">
      {sortKey === col ? (
        sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
      ) : (
        <span style={{ opacity: 0.3 }}><ChevronDown size={12} /></span>
      )}
    </span>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: 'var(--color-lime-voltage)', filter: 'drop-shadow(0 0 5px #9fe870)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>
              Análisis Financiero por SKU — Oct 2026
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Rentabilidad por SKU
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            Margen, rotación y ganancia bruta por producto. Identifica tus estrellas y los que frenan tu capital.
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Ingresos (30d)</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {fmt(totalRevenue)}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-spruce)' }}>
            <TrendingUp size={11} /> +9.4% vs mes anterior
          </p>
        </div>
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Ganancia Bruta (30d)</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {fmt(totalProfit)}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-spruce)' }}>
            <TrendingUp size={11} /> +6.1% vs mes anterior
          </p>
        </div>
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Margen Promedio</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {avgMargin.toFixed(1)}%
          </p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-alarm-red)' }}>
            <TrendingDown size={11} /> -1.2pp vs mes anterior
          </p>
        </div>
        <div className="wise-card-dark !p-5">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--color-paper)' }}>Top Ganador</p>
          <p className="text-lg font-black mt-1 leading-tight" style={{ color: 'var(--color-lime-voltage)' }}>
            {topSKU.name.split(' ').slice(0, 3).join(' ')}
          </p>
          <p className="text-xs mt-1 opacity-80" style={{ color: 'var(--color-paper)' }}>
            {fmt(topSKU.profit30d)} ganancia este mes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="wise-segmented">
          {(['todos', 'potenciar', 'mantener', 'revisar', 'liquidar'] as const).map(r => (
            <button key={r} className={recFilter === r ? 'active' : ''} onClick={() => setRecFilter(r)}>
              {r === 'todos' ? `Todos (${MOCK_SKUS.length})` : REC_CONFIG[r].label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
          <input
            type="search" placeholder="Buscar SKU…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="wise-input pl-9 !py-2 !text-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="wise-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--color-fog)' }}>
              <tr className="text-xs font-bold uppercase tracking-wider border-b border-[var(--color-fog)]"
                style={{ color: 'var(--color-slate)' }}>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3 cursor-pointer select-none" onClick={() => handleSort('margin')}>
                  Margen <SortIcon col="margin" />
                </th>
                <th className="px-5 py-3 cursor-pointer select-none text-right" onClick={() => handleSort('revenue30d')}>
                  Ingresos 30d <SortIcon col="revenue30d" />
                </th>
                <th className="px-5 py-3 cursor-pointer select-none text-right" onClick={() => handleSort('profit30d')}>
                  Ganancia 30d <SortIcon col="profit30d" />
                </th>
                <th className="px-5 py-3 cursor-pointer select-none text-center" onClick={() => handleSort('rotation')}>
                  Rotación <SortIcon col="rotation" />
                </th>
                <th className="px-5 py-3 cursor-pointer select-none text-center" onClick={() => handleSort('trendPct')}>
                  Tendencia <SortIcon col="trendPct" />
                </th>
                <th className="px-5 py-3 text-center">Acción IA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-fog)]">
              {filtered.map(sku => {
                const rec = REC_CONFIG[sku.recommendation];
                return (
                  <tr key={sku.id} className="hover:bg-[var(--color-fog)] transition-colors group">
                    {/* Producto */}
                    <td className="px-5 py-4">
                      <div className="font-mono text-[10px]" style={{ color: 'var(--color-pebble)' }}>{sku.sku}</div>
                      <div className="font-bold leading-tight" style={{ color: 'var(--color-obsidian)' }}>{sku.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{sku.category}</div>
                    </td>

                    {/* Margen con barra */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--color-fog)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(sku.margin / 50) * 100}%`,
                              background: sku.margin >= 40 ? 'var(--color-spruce)' : sku.margin >= 30 ? 'var(--color-forest-ink)' : '#f97316'
                            }}
                          />
                        </div>
                        <span className="font-black text-sm" style={{
                          color: sku.margin >= 40 ? 'var(--color-spruce)' : sku.margin >= 30 ? 'var(--color-forest-ink)' : '#c2410c'
                        }}>
                          {sku.margin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>
                        Costo: S/ {sku.costPrice} → PV: S/ {sku.salePrice}
                      </div>
                    </td>

                    {/* Ingresos */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold" style={{ color: 'var(--color-obsidian)' }}>{fmt(sku.revenue30d)}</span>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{sku.unitsSold30d} u. vendidas</div>
                    </td>

                    {/* Ganancia */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-black" style={{ color: 'var(--color-spruce)' }}>{fmt(sku.profit30d)}</span>
                    </td>

                    {/* Rotación */}
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-sm" style={{ color: sku.rotation >= 5 ? 'var(--color-spruce)' : sku.rotation >= 2 ? 'var(--color-charcoal)' : 'var(--color-alarm-red)' }}>
                        {sku.rotation.toFixed(1)}x
                      </span>
                      <div className="text-xs" style={{ color: 'var(--color-pebble)' }}>/ mes</div>
                    </td>

                    {/* Tendencia */}
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-sm">
                        {sku.trendPct >= 0 ? (
                          <ArrowUpRight size={14} style={{ color: 'var(--color-spruce)' }} />
                        ) : (
                          <ArrowDownRight size={14} style={{ color: 'var(--color-alarm-red)' }} />
                        )}
                        <span style={{ color: sku.trendPct >= 0 ? 'var(--color-spruce)' : 'var(--color-alarm-red)' }}>
                          {sku.trendPct > 0 ? '+' : ''}{sku.trendPct}%
                        </span>
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: rec.bg, color: rec.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rec.dot }} />
                        {rec.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Card IA */}
      <div className="wise-card-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BarChart2 size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: 'var(--color-lime-voltage)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-lime-voltage)' }}>
              Insight de IA
            </span>
          </div>
          <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-paper)', fontFamily: 'var(--font-wise-sans)' }}>
            El 25% de tus SKUs genera el 68% de tu ganancia bruta.
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-paper)', opacity: 0.8 }}>
            <strong style={{ color: 'var(--color-lime-voltage)' }}>Milo, Nescafé y Pampers</strong> son tus motores de rentabilidad.
            Mientras tanto, <strong style={{ color: '#fca5a5' }}>Gillette y Margarina Manty</strong> tienen rotación menor a 1x/mes y
            márgenes bajo 23% — capital estancado que podrías redirigir a SKUs estrella.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/reabastecimiento" className="wise-btn-primary flex items-center gap-2 !bg-[var(--color-lime-voltage)] !text-[var(--color-forest-ink)]">
              <ShoppingCart size={16} /> Reabastecer SKUs Estrella
            </Link>
            <Link href="/inventario" className="wise-btn-outline !border-white/30 !text-white hover:!bg-white/10 flex items-center gap-2">
              Ver Inventario Muerto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
