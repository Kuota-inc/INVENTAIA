'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sparkles, TrendingUp, AlertTriangle, PackageX,
  RefreshCw, DollarSign, PieChart, ShoppingCart, Activity,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { apiFetch } from '@/lib/apiFetch';

interface ExecutiveData {
  summary: {
    totalSkus: number;
    stockoutRiskCount: number;
    deadStockAmount: number;
    recommendedPurchaseAmount: number;
    availableCreditLine: number;
    forecastAccuracy: number | null;
  };
  modules: {
    riesgoQuiebre: Array<{
      id: string;
      sku: string;
      name: string;
      currentStock: number;
      safetyStock: number;
      daysRemaining: number;
      leadTimeDays: number;
      urgency: 'CRITICAL' | 'WARNING' | 'STABLE';
    }>;
    inventarioInmovilizado: Array<{
      id: string;
      sku: string;
      name: string;
      deadQuantity: number;
      capitalTiedUp: number;
      daysInactive: number;
    }>;
    comprasRecomendadas: Array<{
      id: string;
      supplierName: string;
      sku: string;
      productName: string;
      suggestedQuantity: number;
      unitCost: number;
      totalCost: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    capitalRequerido: {
      totalRequired: number;
      immediate7Days: number;
      horizon30Days: number;
      currency: string;
    };
    financiamientoDisponible: Array<{
      id: string;
      bankName: string;
      totalLine: number;
      availableLine: number;
      monthlyRate: number;
      status: string;
    }>;
    forecast90Dias: Array<{
      month: string;
      projectedDemand: number;
      actualHistorical: number;
      lowerBound: number;
      upperBound: number;
    }>;
    rentabilidadSKU: Array<{
      sku: string;
      name: string;
      unitCost: number;
      unitPrice: number;
      marginPercent: number;
      totalRevenue: number;
    }>;
    proveedoresCriticos: Array<{
      id: string;
      name: string;
      leadTimeDays: number;
      activePOs: number;
      reliabilityScore: number;
      integrationType: string;
    }>;
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams?.get('tab') === 'predictiva' ? 'predictiva' : 'resumen';

  const [activeTab, setActiveTab] = useState<'resumen' | 'predictiva'>(initialTab);
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // IA Predictiva View States
  const [selectedSku, setSelectedSku] = useState('Aceite Primor Premium 1L');
  const [predictiveHorizon, setPredictiveHorizon] = useState<'30d' | '60d' | '90d' | '180d'>('90d');

  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab');
    if (tabFromUrl === 'predictiva') {
      setActiveTab('predictiva');
    } else {
      setActiveTab('resumen');
    }
  }, [searchParams]);

  const switchTab = (tab: 'resumen' | 'predictiva') => {
    setActiveTab(tab);
    if (tab === 'predictiva') {
      router.replace('/dashboard?tab=predictiva', { scroll: false });
    } else {
      router.replace('/dashboard', { scroll: false });
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/api/dashboard/cerebro', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setData(json);
        } else {
          throw new Error(json.error || 'Respuesta inválida del servidor');
        }
      } else {
        throw new Error('Error al conectar con la base de datos');
      }
    } catch (err: any) {
      console.error('Error cargando métricas ejecutivas:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      await loadData();
      setSyncFeedback('¡Sincronización completada!');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (e) {
      setSyncFeedback('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const fmt = (v: number | undefined) => `S/ ${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="wise-spinner" />
        <p className="text-sm font-semibold" style={{ color: 'var(--color-slate)' }}>Analizando ecosistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="wise-card !border-[var(--color-alarm-red)] bg-[#fee2e2]">
          <p className="font-bold text-[var(--color-alarm-red)]">Error cargando métricas: {error}</p>
          <button onClick={loadData} className="wise-btn-primary mt-4">Reintentar</button>
        </div>
      </div>
    );
  }

  const { summary, modules } = data!;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Sync */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: 'var(--color-lime-voltage)', filter: 'drop-shadow(0 0 5px #9fe870)' }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>
              KUOTA CEREBRO — ACTIVO
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Centro de Control
          </h1>
          <p className="mt-1 text-sm max-w-2xl" style={{ color: 'var(--color-pebble)' }}>
            Visión unificada de tu ecosistema comercial. La IA está monitoreando quiebres, forecast y rentabilidad en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {syncFeedback && (
            <span className="text-xs font-bold animate-in slide-in-from-right" style={{ color: 'var(--color-forest-ink)' }}>
              {syncFeedback}
            </span>
          )}
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="wise-btn-outline flex items-center gap-2"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar ERP'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="wise-segmented">
        <button className={activeTab === 'resumen' ? 'active' : ''} onClick={() => switchTab('resumen')}>
          Resumen Ejecutivo
        </button>
        <button className={activeTab === 'predictiva' ? 'active' : ''} onClick={() => switchTab('predictiva')}>
          IA Predictiva & Forecast
        </button>
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* TOP KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="wise-card !p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><AlertTriangle size={100} /></div>
              <p className="text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: 'var(--color-slate)' }}>Riesgo de Quiebre</p>
              <p className="text-3xl font-black mt-1 relative z-10" style={{ color: 'var(--color-alarm-red)', fontFamily: 'var(--font-wise-sans)' }}>
                {summary.stockoutRiskCount} <span className="text-lg">SKUs</span>
              </p>
              <Link href="/reabastecimiento" className="text-xs font-bold mt-2 flex items-center gap-1 relative z-10" style={{ color: 'var(--color-alarm-red)' }}>
                Ver alertas <ArrowRight size={12} />
              </Link>
            </div>

            <div className="wise-card !p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><PackageX size={100} /></div>
              <p className="text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: 'var(--color-slate)' }}>Capital Estancado</p>
              <p className="text-3xl font-black mt-1 relative z-10" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
                {fmt(summary.deadStockAmount)}
              </p>
              <Link href="/finanzas/inventario-inmovilizado" className="text-xs font-bold mt-2 flex items-center gap-1 relative z-10" style={{ color: 'var(--color-forest-ink)' }}>
                Liquidar stock <ArrowRight size={12} />
              </Link>
            </div>

            <div className="wise-card !p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><ShoppingCart size={100} /></div>
              <p className="text-xs font-bold uppercase tracking-wider relative z-10" style={{ color: 'var(--color-slate)' }}>Compras Recomendadas</p>
              <p className="text-3xl font-black mt-1 relative z-10" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
                {fmt(summary.recommendedPurchaseAmount)}
              </p>
              <Link href="/compras" className="text-xs font-bold mt-2 flex items-center gap-1 relative z-10" style={{ color: 'var(--color-forest-ink)' }}>
                Generar OC <ArrowRight size={12} />
              </Link>
            </div>

            <div className="wise-card-dark !p-5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={100} /></div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 relative z-10" style={{ color: 'var(--color-paper)' }}>Línea de Crédito</p>
              <p className="text-3xl font-black mt-1 relative z-10" style={{ color: 'var(--color-lime-voltage)', fontFamily: 'var(--font-wise-sans)' }}>
                {fmt(summary.availableCreditLine)}
              </p>
              <Link href="/financiamiento" className="text-xs font-bold mt-2 flex items-center gap-1 relative z-10" style={{ color: 'var(--color-lime-voltage)' }}>
                Financiar compras <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* SECOND ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forecast Accuracy */}
            <div className="wise-card !p-0 overflow-hidden lg:col-span-2">
              <div className="p-5 border-b border-[var(--color-fog)] flex items-center justify-between" style={{ background: 'var(--color-fog)' }}>
                <h3 className="font-bold" style={{ color: 'var(--color-obsidian)' }}>Proyección de Demanda (90 Días)</h3>
                <span className="wise-badge !text-xs !bg-white" style={{ color: 'var(--color-spruce)' }}>
                  {summary.forecastAccuracy}% Exactitud IA
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-end gap-2 h-40">
                  {modules?.forecast90Dias.map((fc, idx) => {
                    const maxDem = Math.max(...modules.forecast90Dias.map(d => d.projectedDemand));
                    const hPct = (fc.projectedDemand / maxDem) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative bg-[var(--color-fog)] rounded-t-sm" style={{ height: '100%' }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                            style={{ height: `${hPct}%`, background: 'var(--color-forest-ink)' }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-obsidian)] text-white text-[10px] font-bold px-2 py-1 rounded">
                              {fc.projectedDemand}u
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-slate)' }}>{fc.month.substring(0,3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Proveedores Críticos */}
            <div className="wise-card !p-0 overflow-hidden">
              <div className="p-5 border-b border-[var(--color-fog)] flex items-center justify-between" style={{ background: 'var(--color-fog)' }}>
                <h3 className="font-bold" style={{ color: 'var(--color-obsidian)' }}>Proveedores Críticos</h3>
                <ShieldCheck size={16} style={{ color: 'var(--color-spruce)' }} />
              </div>
              <div className="divide-y divide-[var(--color-fog)]">
                {modules?.proveedoresCriticos.slice(0, 4).map(sup => (
                  <div key={sup.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-fog)] transition-colors">
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>{sup.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{sup.activePOs} OC activas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm" style={{ color: 'var(--color-spruce)' }}>{sup.leadTimeDays}d LT</div>
                      <div className="text-[10px] font-bold" style={{ color: 'var(--color-slate)' }}>SLA {sup.reliabilityScore}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/proveedores" className="block p-3 text-center text-xs font-bold border-t border-[var(--color-fog)] hover:bg-[var(--color-fog)]" style={{ color: 'var(--color-forest-ink)' }}>
                Ver Directorio Completo
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictiva' && (
        <div className="wise-card !p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-slate)' }}>SKU Analizado</label>
                  <select
                    className="wise-input !py-2 !pr-10 !text-sm font-semibold"
                    value={selectedSku}
                    onChange={(e) => setSelectedSku(e.target.value)}
                  >
                    <option value="Aceite Primor Premium 1L">Aceite Primor Premium 1L</option>
                    <option value="Arroz Costeño 5kg">Arroz Costeño 5kg</option>
                    <option value="Milo Actigen-E 400g">Milo Actigen-E 400g</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="wise-segmented">
              <button className={predictiveHorizon === '30d' ? 'active' : ''} onClick={() => setPredictiveHorizon('30d')}>30 Días</button>
              <button className={predictiveHorizon === '60d' ? 'active' : ''} onClick={() => setPredictiveHorizon('60d')}>60 Días</button>
              <button className={predictiveHorizon === '90d' ? 'active' : ''} onClick={() => setPredictiveHorizon('90d')}>90 Días</button>
            </div>
          </div>

          <div className="relative h-[350px] w-full rounded-xl overflow-hidden border border-[var(--color-fog)] bg-[#fcfdfc] p-6">
            {/* SVG Chart Background lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 pb-12 pointer-events-none opacity-50">
               {[150, 120, 90, 60, 30, 0].map(v => (
                 <div key={v} className="flex items-center gap-4">
                   <span className="text-[10px] font-bold w-6 text-right" style={{ color: 'var(--color-slate)' }}>{v}</span>
                   <div className="flex-1 border-b border-dashed border-[var(--color-fog)]" />
                 </div>
               ))}
            </div>

            {/* Simulated Chart SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-lime-voltage)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-lime-voltage)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Histórico */}
              <path d="M 50 250 L 150 180 L 250 220 L 350 120 L 450 160 L 550 80" fill="none" stroke="var(--color-slate)" strokeWidth="3" strokeDasharray="6 6" />

              {/* Predictivo Area */}
              <path d="M 550 80 L 650 110 L 750 90 L 850 40 L 950 160 L 950 280 L 550 280 Z" fill="url(#predGrad)" />

              {/* Predictivo Line */}
              <path d="M 550 80 L 650 110 L 750 90 L 850 40 L 950 160" fill="none" stroke="var(--color-forest-ink)" strokeWidth="4" />

              {/* Puntos Histórico */}
              <circle cx="150" cy="180" r="4" fill="var(--color-slate)" />
              <circle cx="250" cy="220" r="4" fill="var(--color-slate)" />
              <circle cx="350" cy="120" r="4" fill="var(--color-slate)" />
              <circle cx="450" cy="160" r="4" fill="var(--color-slate)" />

              {/* Puntos Predictivo */}
              <circle cx="550" cy="80" r="6" fill="var(--color-forest-ink)" />
              <circle cx="650" cy="110" r="6" fill="var(--color-paper)" stroke="var(--color-forest-ink)" strokeWidth="3" />
              <circle cx="750" cy="90" r="6" fill="var(--color-paper)" stroke="var(--color-forest-ink)" strokeWidth="3" />
              <circle cx="850" cy="40" r="6" fill="var(--color-paper)" stroke="var(--color-forest-ink)" strokeWidth="3" />
              <circle cx="950" cy="160" r="6" fill="var(--color-paper)" stroke="var(--color-forest-ink)" strokeWidth="3" />

              {/* Línea Divisoria HOY */}
              <line x1="550" y1="20" x2="550" y2="280" stroke="var(--color-forest-ink)" strokeWidth="2" strokeDasharray="4 4" />
              <rect x="510" y="20" width="80" height="24" rx="12" fill="var(--color-forest-ink)" />
              <text x="550" y="36" fill="var(--color-lime-voltage)" fontSize="12" fontWeight="600" textAnchor="middle">HOY</text>
            </svg>

            {/* X Axis Labels */}
            <div className="absolute bottom-4 left-[3rem] right-4 flex justify-between text-[10px] font-bold" style={{ color: 'var(--color-slate)' }}>
              <span>09-01</span>
              <span>09-15</span>
              <span>09-29</span>
              <span>10-13</span>
              <span style={{ color: 'var(--color-forest-ink)' }}>10-27</span>
              <span style={{ color: 'var(--color-forest-ink)' }}>11-10</span>
              <span style={{ color: 'var(--color-forest-ink)' }}>11-24</span>
              <span style={{ color: 'var(--color-forest-ink)' }}>12-08</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-fog)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Tendencia</p>
              <p className="text-xl font-black mt-1 flex items-center gap-2" style={{ color: 'var(--color-spruce)', fontFamily: 'var(--font-wise-sans)' }}>
                <TrendingUp size={20} /> Alcista (+18%)
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-fog)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Estacionalidad</p>
              <p className="text-xl font-black mt-1 flex items-center gap-2" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
                <Zap size={20} style={{ color: '#f59e0b' }} /> Alta (Campaña Verano)
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-linen-mist)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-forest-ink)' }}>Acción Sugerida</p>
              <Link href="/reabastecimiento" className="text-sm font-bold mt-2 flex items-center gap-1" style={{ color: 'var(--color-forest-ink)' }}>
                Adelantar compra 14 días <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="wise-spinner" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
