'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, ShoppingCart, ArrowRight, Search, TrendingDown,
  PackageX, CheckCircle2, Clock, Zap, BarChart2, ChevronRight,
  Sparkles, Truck, Building2, Info
} from 'lucide-react';
import Link from 'next/link';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Urgency = 'critico' | 'urgente' | 'planificar';

type Recommendation = {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  daysLeft: number;
  dailyAvgSales: number;
  suggestedQty: number;
  suggestedUnits: string;
  unitCost: number;
  totalInvestment: number;
  lostSalesRisk: number;
  urgency: Urgency;
  provider: string;
  providerId: string;
  forecastDemand: number; // unidades próximos 30d
  coverageDaysAfterOrder: number;
};

// ── Mock Data Enriquecida ─────────────────────────────────────────────────────
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r-001', sku: 'ALC-001', name: 'Aceite Primor Premium 1L', category: 'Alimentos',
    currentStock: 12, daysLeft: 2, dailyAvgSales: 6, suggestedQty: 5, suggestedUnits: 'cajas x 12',
    unitCost: 98.5, totalInvestment: 492.5, lostSalesRisk: 3200,
    urgency: 'critico', provider: 'Alicorp S.A.A.', providerId: 'sup-001',
    forecastDemand: 180, coverageDaysAfterOrder: 32,
  },
  {
    id: 'r-002', sku: 'NST-001', name: 'Milo Actigen-E 400g', category: 'Alimentos',
    currentStock: 48, daysLeft: 4, dailyAvgSales: 12, suggestedQty: 10, suggestedUnits: 'cajas x 12',
    unitCost: 108, totalInvestment: 1080, lostSalesRisk: 2800,
    urgency: 'critico', provider: 'Nestlé Perú S.A.', providerId: 'sup-003',
    forecastDemand: 360, coverageDaysAfterOrder: 34,
  },
  {
    id: 'r-003', sku: 'PG-001', name: 'Ariel Líquido Doble Poder 2L', category: 'Higiene',
    currentStock: 24, daysLeft: 6, dailyAvgSales: 4, suggestedQty: 4, suggestedUnits: 'cajas x 6',
    unitCost: 132, totalInvestment: 528, lostSalesRisk: 1600,
    urgency: 'urgente', provider: 'Procter & Gamble Perú', providerId: 'sup-002',
    forecastDemand: 120, coverageDaysAfterOrder: 30,
  },
  {
    id: 'r-004', sku: 'NST-002', name: 'Nescafé Tradición 200g', category: 'Alimentos',
    currentStock: 36, daysLeft: 8, dailyAvgSales: 4.5, suggestedQty: 6, suggestedUnits: 'cajas x 12',
    unitCost: 192, totalInvestment: 1152, lostSalesRisk: 900,
    urgency: 'urgente', provider: 'Nestlé Perú S.A.', providerId: 'sup-003',
    forecastDemand: 135, coverageDaysAfterOrder: 38,
  },
  {
    id: 'r-005', sku: 'ALC-003', name: 'Fideos Don Vittorio Spaghetti 500g', category: 'Alimentos',
    currentStock: 120, daysLeft: 14, dailyAvgSales: 8.6, suggestedQty: 8, suggestedUnits: 'cajas x 20',
    unitCost: 54, totalInvestment: 432, lostSalesRisk: 0,
    urgency: 'planificar', provider: 'Alicorp S.A.A.', providerId: 'sup-001',
    forecastDemand: 258, coverageDaysAfterOrder: 44,
  },
  {
    id: 'r-006', sku: 'PG-002', name: 'Pampers Recién Nacido x 40', category: 'Higiene',
    currentStock: 32, daysLeft: 10, dailyAvgSales: 3.2, suggestedQty: 3, suggestedUnits: 'cajas x 4',
    unitCost: 148, totalInvestment: 444, lostSalesRisk: 0,
    urgency: 'planificar', provider: 'Procter & Gamble Perú', providerId: 'sup-002',
    forecastDemand: 96, coverageDaysAfterOrder: 40,
  },
  {
    id: 'r-007', sku: 'NST-005', name: 'Leche Gloria Evaporada 400g', category: 'Alimentos',
    currentStock: 18, daysLeft: 3, dailyAvgSales: 6, suggestedQty: 8, suggestedUnits: 'cajas x 24',
    unitCost: 115.2, totalInvestment: 921.6, lostSalesRisk: 2100,
    urgency: 'critico', provider: 'Nestlé Perú S.A.', providerId: 'sup-003',
    forecastDemand: 180, coverageDaysAfterOrder: 33,
  },
];

const URGENCY_CONFIG: Record<Urgency, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  critico:   { label: 'Crítico',    bg: '#fee2e2', color: 'var(--color-alarm-red)', icon: <Zap size={12} /> },
  urgente:   { label: 'Urgente',    bg: '#fff7ed', color: '#c2410c',                icon: <AlertTriangle size={12} /> },
  planificar:{ label: 'Planificar', bg: 'var(--color-linen-mist)', color: 'var(--color-spruce)', icon: <Clock size={12} /> },
};

// ── Componente ─────────────────────────────────────────────────────────────────
export default function ReabastecimientoPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (v: number) => `S/ ${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const filtered = useMemo(() =>
    MOCK_RECOMMENDATIONS.filter(r => {
      const matchUrg = urgencyFilter === 'todos' || r.urgency === urgencyFilter;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchUrg && matchSearch;
    }),
    [urgencyFilter, searchQuery]
  );

  const criticos = MOCK_RECOMMENDATIONS.filter(r => r.urgency === 'critico').length;
  const urgentes = MOCK_RECOMMENDATIONS.filter(r => r.urgency === 'urgente').length;
  const totalRisk = MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.lostSalesRisk, 0);
  const selectedItems = MOCK_RECOMMENDATIONS.filter(r => selectedIds.has(r.id));
  const totalSelected = selectedItems.reduce((a, r) => a + r.totalInvestment, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} style={{ color: 'var(--color-lime-voltage)', filter: 'drop-shadow(0 0 6px #9fe870)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>
              Motor de IA — Actualizado hace 12 min
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Recomendaciones de Compra
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            La IA analizó tu inventario, forecast y lead times. Aquí están tus próximos movimientos.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Link
            href="/compras"
            className="wise-btn-primary flex items-center gap-2 self-start"
          >
            <ShoppingCart size={18} />
            Ordenar {selectedIds.size} SKU{selectedIds.size > 1 ? 's' : ''} — {formatCurrency(totalSelected)}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* KPI Cards — Situación Actual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="wise-card-dark !p-5">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70" style={{ color: 'var(--color-paper)' }}>SKUs en Riesgo</p>
          <p className="text-4xl font-black mt-1" style={{ color: 'var(--color-lime-voltage)', fontFamily: 'var(--font-wise-sans)' }}>
            {criticos + urgentes}
          </p>
          <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--color-paper)' }}>{criticos} críticos · {urgentes} urgentes</p>
        </div>
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Ventas en Riesgo</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-alarm-red)', fontFamily: 'var(--font-wise-sans)' }}>
            {formatCurrency(totalRisk)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Si no reabasteces hoy</p>
        </div>
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Inversión Sugerida</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            {formatCurrency(MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.totalInvestment, 0))}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Para 7 SKUs priorizados</p>
        </div>
        <div className="wise-card !p-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Cobertura Promedio</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
            36 días
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-pebble)' }}>Después de ordenar todo</p>
        </div>
      </div>

      {/* Filtros + Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="wise-segmented">
          {(['todos', 'critico', 'urgente', 'planificar'] as const).map(u => (
            <button
              key={u}
              className={urgencyFilter === u ? 'active' : ''}
              onClick={() => setUrgencyFilter(u)}
            >
              {u === 'todos' ? `Todos (${MOCK_RECOMMENDATIONS.length})` :
               u === 'critico' ? `🔴 Críticos (${criticos})` :
               u === 'urgente' ? `🟠 Urgentes (${urgentes})` :
               `🟢 Planificar (${MOCK_RECOMMENDATIONS.filter(r => r.urgency === 'planificar').length})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
          <input
            type="search"
            placeholder="Buscar SKU…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="wise-input pl-9 !py-2 !text-sm"
          />
        </div>
      </div>

      {/* Tabla de Recomendaciones */}
      <div className="wise-card !p-0 overflow-hidden">
        <div className="px-6 py-3 border-b border-[var(--color-fog)] flex items-center justify-between" style={{ background: 'var(--color-fog)' }}>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              onChange={selectAll}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--color-forest-ink)]"
            />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
              {selectedIds.size > 0 ? `${selectedIds.size} seleccionados — ${formatCurrency(totalSelected)}` : `${filtered.length} recomendaciones`}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <button onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold" style={{ color: 'var(--color-alarm-red)' }}>
              Limpiar selección
            </button>
          )}
        </div>

        <div className="divide-y divide-[var(--color-fog)]">
          {filtered.map(item => {
            const urgConf = URGENCY_CONFIG[item.urgency];
            const isSelected = selectedIds.has(item.id);
            // Mini forecast bar
            const barWidth = Math.min(100, Math.round((item.daysLeft / 30) * 100));

            return (
              <div
                key={item.id}
                className={`px-6 py-4 transition-colors ${isSelected ? 'bg-[var(--color-linen-mist)]' : 'hover:bg-[var(--color-fog)]'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1 w-4 h-4 rounded cursor-pointer accent-[var(--color-forest-ink)] flex-shrink-0"
                  />

                  {/* Urgency Badge */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: urgConf.bg, color: urgConf.color }}
                    >
                      {urgConf.icon} {urgConf.label}
                    </span>
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono" style={{ color: 'var(--color-pebble)' }}>{item.sku}</span>
                        <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--color-obsidian)' }}>{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 size={11} style={{ color: 'var(--color-pebble)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-pebble)' }}>{item.provider}</span>
                        </div>
                      </div>

                      {/* Días restantes visual */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold mb-1" style={{ color: item.daysLeft <= 3 ? 'var(--color-alarm-red)' : item.daysLeft <= 7 ? '#c2410c' : 'var(--color-charcoal)' }}>
                          {item.daysLeft} días restantes
                        </div>
                        <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-fog)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${barWidth}%`,
                              background: item.daysLeft <= 3 ? 'var(--color-alarm-red)' : item.daysLeft <= 7 ? '#f97316' : 'var(--color-spruce)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Métricas fila */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-fog)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Stock Actual</div>
                        <div className="font-black text-sm mt-0.5" style={{ color: 'var(--color-obsidian)' }}>{item.currentStock} u.</div>
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-fog)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Venta Diaria</div>
                        <div className="font-black text-sm mt-0.5" style={{ color: 'var(--color-obsidian)' }}>{item.dailyAvgSales} u/día</div>
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-linen-mist)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Compra Sugerida</div>
                        <div className="font-black text-sm mt-0.5" style={{ color: 'var(--color-forest-ink)' }}>
                          {item.suggestedQty} {item.suggestedUnits}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ background: isSelected ? 'var(--color-forest-ink)' : 'var(--color-fog)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isSelected ? 'var(--color-lime-voltage)' : 'var(--color-slate)' }}>
                          Inversión
                        </div>
                        <div className="font-black text-sm mt-0.5" style={{ color: isSelected ? 'var(--color-paper)' : 'var(--color-obsidian)' }}>
                          {formatCurrency(item.totalInvestment)}
                        </div>
                      </div>
                    </div>

                    {/* Fila inferior: riesgo + cobertura post-orden */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-fog)]">
                      <div className="flex items-center gap-4 text-xs">
                        {item.lostSalesRisk > 0 && (
                          <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--color-alarm-red)' }}>
                            <AlertTriangle size={11} />
                            Riesgo: {formatCurrency(item.lostSalesRisk)} en ventas perdidas
                          </span>
                        )}
                        <span className="flex items-center gap-1" style={{ color: 'var(--color-pebble)' }}>
                          <BarChart2 size={11} />
                          Cobertura tras orden: {item.coverageDaysAfterOrder} días
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className={`!text-xs !py-1.5 !px-4 ${isSelected ? 'wise-btn-outline' : 'wise-btn-primary'}`}
                        style={isSelected ? { borderColor: 'var(--color-alarm-red)', color: 'var(--color-alarm-red)' } : {}}
                      >
                        {isSelected ? '✓ Seleccionado' : '+ Añadir a OC'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Flotante */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-4 px-6 py-4 rounded-[28px] shadow-2xl" style={{ background: 'var(--color-forest-ink)' }}>
            <div>
              <p className="text-xs opacity-70" style={{ color: 'var(--color-paper)' }}>
                {selectedIds.size} SKU{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
              </p>
              <p className="font-black text-xl" style={{ color: 'var(--color-lime-voltage)', fontFamily: 'var(--font-wise-sans)' }}>
                {formatCurrency(totalSelected)}
              </p>
            </div>
            <Link href="/compras" className="wise-btn-primary flex items-center gap-2 !px-6">
              <ShoppingCart size={18} /> Generar Orden de Compra
            </Link>
            <Link href="/financiamiento" className="wise-btn-outline !border-white/30 !text-white hover:!bg-white/10 flex items-center gap-2 !px-4">
              Financiar <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
