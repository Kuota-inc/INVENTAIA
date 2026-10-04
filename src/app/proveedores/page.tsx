'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, ShieldCheck, MapPin, Package, CreditCard, ChevronRight,
  Star, Truck, Clock, Plus, Trash2, LayoutGrid, List, X,
  Building2, TrendingUp, Filter, SlidersHorizontal, Landmark
} from 'lucide-react';
import Link from 'next/link';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Provider = {
  id: string;
  name: string;
  description: string;
  category: string;
  min_order_amount: number;
  payment_terms: string;
  logistics_terms: string;
  fiscal_id: string;
  verified: boolean;
  location: string;
  products_offered: string[];
  rating: number;
  reviews: number;
  lead_time_days: number;
  reliability_score: number;
  discount_available: boolean;
};

// ── Mock Data Enriquecida ──────────────────────────────────────────────────────
const MOCK_MARKETPLACE: Provider[] = [
  {
    id: 'sup-001', name: 'Alicorp S.A.A.', description: 'Líder en consumo masivo peruano. Portafolio completo de aceites, harinas, fideos, galletas y salsas con distribución nacional y cobertura de última milla.',
    category: 'Alimentos', min_order_amount: 5000, payment_terms: 'Crédito 30 días',
    logistics_terms: 'Entrega directa en almacén del cliente. Flota propia nacional.', fiscal_id: 'RUC 20100055225',
    verified: true, location: 'Lima, Perú', products_offered: ['Aceite Primor', 'Harina Blanca Nieve', 'Fideos Don Vittorio', 'Galletas Casino'],
    rating: 4.8, reviews: 342, lead_time_days: 3, reliability_score: 97, discount_available: true,
  },
  {
    id: 'sup-002', name: 'Procter & Gamble Perú', description: 'Multinacional líder en productos de cuidado personal y del hogar. Marcas globales con soporte comercial local.',
    category: 'Higiene & Cuidado', min_order_amount: 3000, payment_terms: 'Contado',
    logistics_terms: 'Operador logístico 3PL. Entrega entre 2–5 días hábiles.', fiscal_id: 'RUC 20101826251',
    verified: true, location: 'Lima, Perú', products_offered: ['Ariel', 'Pampers', 'Head & Shoulders', 'Gillette', 'Always'],
    rating: 4.6, reviews: 218, lead_time_days: 4, reliability_score: 94, discount_available: false,
  },
  {
    id: 'sup-003', name: 'Nestlé Perú S.A.', description: 'El proveedor de nutrición, salud y bienestar más grande del mundo. Portafolio premium para retail moderno y tradicional.',
    category: 'Alimentos', min_order_amount: 8000, payment_terms: 'Crédito 60 días',
    logistics_terms: 'Entrega programada semanal. Permite consolidación de pedidos.', fiscal_id: 'RUC 20100070970',
    verified: true, location: 'Lima, Perú', products_offered: ['Milo', 'Nescafé', 'Maggi', 'Kit Kat', 'Leche Gloria'],
    rating: 4.9, reviews: 501, lead_time_days: 5, reliability_score: 99, discount_available: true,
  },
  {
    id: 'sup-004', name: 'Unilever Andina Perú', description: 'Portafolio de alimentos, cuidado del hogar e higiene personal para todos los formatos de retail.',
    category: 'Higiene & Cuidado', min_order_amount: 2500, payment_terms: 'Crédito 45 días',
    logistics_terms: 'Distribución por zonas. Lima en 24h, provincias en 5–7 días.', fiscal_id: 'RUC 20100055555',
    verified: true, location: 'Lima, Perú', products_offered: ['Rexona', 'Dove', 'OMO', 'Vaseline', 'Knorr'],
    rating: 4.5, reviews: 189, lead_time_days: 2, reliability_score: 92, discount_available: true,
  },
  {
    id: 'sup-005', name: 'BACKUS & Johnston', description: 'Principal productor de bebidas en Perú. Cervezas, maltas y bebidas no alcohólicas con cobertura nacional.',
    category: 'Bebidas', min_order_amount: 10000, payment_terms: 'Contado',
    logistics_terms: 'Entrega con flota refrigerada propia. Requiere cita previa.', fiscal_id: 'RUC 20100113610',
    verified: true, location: 'Lima, Perú', products_offered: ['Cristal', 'Pilsen Callao', 'Cusqueña', 'Maltin Power'],
    rating: 4.7, reviews: 276, lead_time_days: 2, reliability_score: 96, discount_available: false,
  },
  {
    id: 'sup-006', name: 'Corporación Lindley', description: 'Embotellador exclusivo de Coca-Cola en Perú. Amplio portafolio de bebidas carbonatadas, agua y néctares.',
    category: 'Bebidas', min_order_amount: 4000, payment_terms: 'Crédito 30 días',
    logistics_terms: 'Rutas fijas de reparto. Requiere espacio de descarga adecuado.', fiscal_id: 'RUC 20100021890',
    verified: true, location: 'Lima, Perú', products_offered: ['Coca-Cola', 'Fanta', 'Sprite', 'Inca Kola', 'Agua San Luis'],
    rating: 4.6, reviews: 312, lead_time_days: 3, reliability_score: 95, discount_available: true,
  },
  {
    id: 'sup-007', name: 'BF Suma Medica', description: 'Distribuidora especializada en productos de cuidado del hogar, limpieza industrial y artículos de higiene para el sector comercial.',
    category: 'Limpieza', min_order_amount: 1500, payment_terms: 'Crédito 15 días',
    logistics_terms: 'Despacho en 24–48h en Lima. Envíos a provincia por carrier.', fiscal_id: 'RUC 20512344321',
    verified: false, location: 'Lima, Perú', products_offered: ['Lejía Sapolio', 'Limpiatodo', 'Detergente Industrial', 'Desinfectantes'],
    rating: 4.1, reviews: 87, lead_time_days: 2, reliability_score: 88, discount_available: true,
  },
  {
    id: 'sup-008', name: 'Cartavio Rum Company', description: 'Productor peruano de rones premium y azúcar refinada. Exportador con presencia en retail nacional.',
    category: 'Bebidas', min_order_amount: 6000, payment_terms: 'Crédito 30 días',
    logistics_terms: 'Despacho desde La Libertad. Lead time de 7 días a Lima.', fiscal_id: 'RUC 20131700831',
    verified: true, location: 'Trujillo, Perú', products_offered: ['Ron Cartavio', 'Azúcar Rubia Cartavio', 'Ron Superior'],
    rating: 4.4, reviews: 134, lead_time_days: 7, reliability_score: 91, discount_available: false,
  },
];

const CATEGORIES = ['Todas', 'Alimentos', 'Bebidas', 'Higiene & Cuidado', 'Limpieza'];
const PAYMENT_TERMS = ['Todos', 'Contado', 'Crédito 15 días', 'Crédito 30 días', 'Crédito 45 días', 'Crédito 60 días'];
const MIN_ORDER_OPTIONS = [
  { label: 'Cualquier monto', value: 0 },
  { label: 'Hasta S/ 3,000', value: 3000 },
  { label: 'Hasta S/ 5,000', value: 5000 },
  { label: 'Hasta S/ 10,000', value: 10000 },
];

// ── Componente de Estrellas ────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? 'var(--color-forest-ink)' : 'none'}
          stroke={s <= Math.round(rating) ? 'var(--color-forest-ink)' : 'var(--color-pebble)'}
        />
      ))}
      <span className="ml-1 text-xs font-bold" style={{ color: 'var(--color-charcoal)' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Página Principal ───────────────────────────────────────────────────────────
export default function ProveedoresPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'mis_providers'>('marketplace');
  const [myProviderIds, setMyProviderIds] = useState<Set<string>>(new Set(['sup-001', 'sup-003']));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('Todos');
  const [maxMinOrder, setMaxMinOrder] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const myProviders = MOCK_MARKETPLACE.filter(p => myProviderIds.has(p.id));

  const filteredMarketplace = useMemo(() => {
    return MOCK_MARKETPLACE.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.products_offered.some(prod => prod.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchPayment = selectedPaymentTerm === 'Todos' || p.payment_terms === selectedPaymentTerm;
      const matchMinOrder = maxMinOrder === 0 || p.min_order_amount <= maxMinOrder;
      return matchSearch && matchCategory && matchPayment && matchMinOrder;
    });
  }, [searchQuery, selectedCategory, selectedPaymentTerm, maxMinOrder]);

  const filteredMyProviders = useMemo(() =>
    myProviders.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [myProviders, searchQuery]
  );

  const displayList = activeTab === 'marketplace' ? filteredMarketplace : filteredMyProviders;
  const activeFilters = (selectedCategory !== 'Todas' ? 1 : 0) +
    (selectedPaymentTerm !== 'Todos' ? 1 : 0) +
    (maxMinOrder !== 0 ? 1 : 0);

  const handleAdd = (id: string) => {
    setMyProviderIds(prev => new Set([...prev, id]));
  };

  const handleRemove = (id: string) => {
    setMyProviderIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const clearFilters = () => {
    setSelectedCategory('Todas');
    setSelectedPaymentTerm('Todos');
    setMaxMinOrder(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Marketplace de Proveedores
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            Descubre, evalúa y conecta con los mejores distribuidores para tu empresa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="wise-badge" style={{ background: 'var(--color-linen-mist)' }}>
            {myProviderIds.size} en Mi Red
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="wise-segmented">
        <button className={activeTab === 'marketplace' ? 'active' : ''} onClick={() => setActiveTab('marketplace')}>
          Marketplace ({MOCK_MARKETPLACE.length})
        </button>
        <button className={activeTab === 'mis_providers' ? 'active' : ''} onClick={() => setActiveTab('mis_providers')}>
          Mi Red ({myProviderIds.size})
        </button>
      </div>

      {/* Barra de Búsqueda + Controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
          <input
            type="search"
            placeholder="Buscar proveedor o producto…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="wise-input pl-10"
          />
        </div>

        {activeTab === 'marketplace' && (
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`wise-btn-outline flex items-center gap-2 relative ${showFilters ? '!bg-[var(--color-forest-ink)] !text-white !border-[var(--color-forest-ink)]' : ''}`}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                style={{ background: 'var(--color-lime-voltage)', color: 'var(--color-forest-ink)' }}>
                {activeFilters}
              </span>
            )}
          </button>
        )}

        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--color-fog)' }}>
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-full transition-all"
            style={{
              background: viewMode === 'grid' ? 'var(--color-lime-voltage)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-forest-ink)' : 'var(--color-pebble)'
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-full transition-all"
            style={{
              background: viewMode === 'list' ? 'var(--color-lime-voltage)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-forest-ink)' : 'var(--color-pebble)'
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && activeTab === 'marketplace' && (
        <div className="wise-card !p-5 border-2 border-[var(--color-fog)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-charcoal)' }}>Filtros Avanzados</h3>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs font-semibold underline" style={{ color: 'var(--color-alarm-red)' }}>
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-slate)' }}>
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                    style={selectedCategory === cat
                      ? { background: 'var(--color-forest-ink)', color: 'var(--color-paper)', borderColor: 'var(--color-forest-ink)' }
                      : { background: 'transparent', color: 'var(--color-charcoal)', borderColor: 'var(--color-fog)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-slate)' }}>
                Condición de Pago
              </label>
              <select
                value={selectedPaymentTerm}
                onChange={e => setSelectedPaymentTerm(e.target.value)}
                className="wise-input !py-2 !text-sm"
              >
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-slate)' }}>
                Pedido Mínimo
              </label>
              <select
                value={maxMinOrder}
                onChange={e => setMaxMinOrder(Number(e.target.value))}
                className="wise-input !py-2 !text-sm"
              >
                {MIN_ORDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {displayList.length === 0 ? (
        <div className="wise-card text-center py-16">
          <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--color-pebble)' }} />
          <p className="font-bold" style={{ color: 'var(--color-charcoal)' }}>No se encontraron proveedores</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-pebble)' }}>Prueba ajustando los filtros o la búsqueda.</p>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="wise-btn-outline mt-4">Limpiar filtros</button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Vista Grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayList.map(provider => {
            const isInNetwork = myProviderIds.has(provider.id);
            return (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className="wise-card cursor-pointer hover:shadow-lg transition-shadow group relative"
              >
                {provider.discount_available && (
                  <div className="absolute top-4 right-4">
                    <span className="wise-badge" style={{ background: 'var(--color-linen-mist)', fontSize: '10px', padding: '4px 10px' }}>
                      Descuento Disp.
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-fog)' }}>
                    <Building2 size={24} style={{ color: 'var(--color-forest-ink)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm truncate" style={{ color: 'var(--color-obsidian)' }}>{provider.name}</span>
                      {provider.verified && <ShieldCheck size={14} style={{ color: '#16a34a' }} />}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-pebble)' }}>{provider.category}</span>
                  </div>
                </div>

                <StarRating rating={provider.rating} />
                <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--color-pebble)' }}>{provider.reviews} reseñas</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-fog)' }}>
                    <div className="text-xs" style={{ color: 'var(--color-slate)' }}>Lead Time</div>
                    <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-obsidian)' }}>
                      {provider.lead_time_days}d
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl" style={{ background: 'var(--color-fog)' }}>
                    <div className="text-xs" style={{ color: 'var(--color-slate)' }}>Confiabilidad</div>
                    <div className="font-bold text-sm mt-0.5" style={{ color: 'var(--color-spruce)' }}>
                      {provider.reliability_score}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-4" style={{ color: 'var(--color-pebble)' }}>
                  <span className="flex items-center gap-1">
                    <CreditCard size={12} /> {provider.payment_terms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package size={12} /> Min. S/ {provider.min_order_amount.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); isInNetwork ? handleRemove(provider.id) : handleAdd(provider.id); }}
                  className={isInNetwork ? 'wise-btn-outline w-full justify-center !text-sm !py-2' : 'wise-btn-primary w-full justify-center !text-sm !py-2'}
                >
                  {isInNetwork ? '✓ En Mi Red' : '+ Añadir a Mi Red'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Vista Lista ── */
        <div className="wise-card !p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead style={{ background: 'var(--color-fog)' }}>
              <tr className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
                <th className="px-6 py-3">Proveedor</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3">Condición de Pago</th>
                <th className="px-6 py-3 text-right">Pedido Mínimo</th>
                <th className="px-6 py-3 text-center">Lead Time</th>
                <th className="px-6 py-3 text-center">Rating</th>
                <th className="px-6 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-fog)]">
              {displayList.map(provider => {
                const isInNetwork = myProviderIds.has(provider.id);
                return (
                  <tr
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className="hover:bg-[var(--color-fog)] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--color-fog)' }}>
                          <Building2 size={18} style={{ color: 'var(--color-forest-ink)' }} />
                        </div>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-1" style={{ color: 'var(--color-obsidian)' }}>
                            {provider.name}
                            {provider.verified && <ShieldCheck size={12} style={{ color: '#16a34a' }} />}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-pebble)' }}>{provider.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="wise-badge !text-xs !px-3 !py-1">{provider.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-charcoal)' }}>{provider.payment_terms}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>
                      S/ {provider.min_order_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-sm" style={{ color: 'var(--color-charcoal)' }}>{provider.lead_time_days}d</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} fill="var(--color-forest-ink)" stroke="var(--color-forest-ink)" />
                        <span className="font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>{provider.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => isInNetwork ? handleRemove(provider.id) : handleAdd(provider.id)}
                        className={isInNetwork
                          ? 'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--color-fog)] text-[var(--color-pebble)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors'
                          : 'wise-btn-primary !px-3 !py-1.5 !text-xs'
                        }
                      >
                        {isInNetwork ? '✓ En Mi Red' : '+ Añadir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL DE DETALLE ──────────────────────────────────────────────────── */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--color-fog)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--color-fog)] flex justify-between items-start flex-shrink-0">
              <div className="flex gap-4 items-center">
                <div className="p-3 rounded-xl" style={{ background: 'var(--color-linen-mist)' }}>
                  <Building2 size={28} style={{ color: 'var(--color-forest-ink)' }} />
                </div>
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>
                    {selectedProvider.name}
                    {selectedProvider.verified && <ShieldCheck size={18} style={{ color: '#16a34a' }} />}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm" style={{ color: 'var(--color-pebble)' }}>{selectedProvider.category}</span>
                    <StarRating rating={selectedProvider.rating} />
                    <span className="text-xs" style={{ color: 'var(--color-pebble)' }}>({selectedProvider.reviews} reseñas)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-full hover:bg-[var(--color-fog)] transition-colors"
                style={{ color: 'var(--color-pebble)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal)' }}>
                {selectedProvider.description}
              </p>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Lead Time', value: `${selectedProvider.lead_time_days} días`, icon: Truck },
                  { label: 'Confiabilidad', value: `${selectedProvider.reliability_score}%`, icon: TrendingUp },
                  { label: 'Min. Pedido', value: `S/ ${selectedProvider.min_order_amount.toLocaleString()}`, icon: Package },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--color-fog)' }}>
                    <Icon size={18} className="mx-auto mb-1" style={{ color: 'var(--color-forest-ink)' }} />
                    <div className="font-black text-sm" style={{ color: 'var(--color-obsidian)' }}>{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-slate)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Datos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-[var(--color-fog)]">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>Datos Fiscales</div>
                  <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.fiscal_id}
                  </div>
                  <div className="text-sm font-medium flex items-center gap-2 mt-2" style={{ color: 'var(--color-obsidian)' }}>
                    <MapPin size={14} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.location}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-[var(--color-fog)]">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>Condiciones</div>
                  <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
                    <CreditCard size={14} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.payment_terms}
                  </div>
                  <div className="text-sm font-medium flex items-center gap-2 mt-2" style={{ color: 'var(--color-obsidian)' }}>
                    <Clock size={14} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.logistics_terms.slice(0, 40)}…
                  </div>
                </div>
              </div>

              {/* Catálogo */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>Catálogo</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.products_offered.map(prod => (
                    <span key={prod} className="wise-badge" style={{ background: 'var(--color-fog)', fontSize: '11px', padding: '5px 10px' }}>
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financiar CTA */}
              {myProviderIds.has(selectedProvider.id) && (
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--color-linen-mist)' }}>
                  <div className="flex items-center gap-3">
                    <Landmark size={20} style={{ color: 'var(--color-forest-ink)' }} />
                    <div>
                      <div className="font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>¿Necesitas financiar una OC?</div>
                      <div className="text-xs" style={{ color: 'var(--color-pebble)' }}>Usa tu línea de crédito KUOTA sin salir de la plataforma.</div>
                    </div>
                  </div>
                  <Link href="/financiamiento" className="wise-btn-primary !px-4 !py-2 !text-sm flex items-center gap-1">
                    Financiar <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[var(--color-fog)] bg-gray-50 flex justify-end gap-3 rounded-b-[28px] flex-shrink-0">
              <button onClick={() => setSelectedProvider(null)} className="wise-btn-outline">Cerrar</button>
              {myProviderIds.has(selectedProvider.id) ? (
                <button
                  onClick={() => { handleRemove(selectedProvider.id); setSelectedProvider(null); }}
                  className="wise-btn-outline !border-red-300 !text-red-600 hover:!bg-red-50"
                >
                  Quitar de Mi Red
                </button>
              ) : (
                <button
                  onClick={() => { handleAdd(selectedProvider.id); setSelectedProvider(null); }}
                  className="wise-btn-primary"
                >
                  + Añadir a Mi Red
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
