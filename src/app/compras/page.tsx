'use client';

import React, { useState, useMemo, Suspense } from 'react';
import {
  ShoppingCart, Plus, Send, Search, CheckCircle2, Building2,
  Package, Truck, ExternalLink, Minus, Trash2, ChevronRight,
  Landmark, FileText, Clock, AlertCircle, Star, X
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ── Datos Mock ────────────────────────────────────────────────────────────────
const MOCK_PROVIDERS = [
  {
    id: 'sup-001', name: 'Alicorp S.A.A.', category: 'Alimentos', verified: true,
    location: 'Lima', min_order_amount: 5000, payment_terms: 'Crédito 30 días', lead_time_days: 3,
    products: [
      { sku: 'ALC-001', name: 'Aceite Primor Premium 1L', unit: 'caja x 12', price: 98.50 },
      { sku: 'ALC-002', name: 'Harina Blanca Nieve 1kg', unit: 'bolsa x 25kg', price: 62.00 },
      { sku: 'ALC-003', name: 'Fideos Don Vittorio Spaghetti 500g', unit: 'caja x 20', price: 54.00 },
      { sku: 'ALC-004', name: 'Galletas Casino Chocolate', unit: 'caja x 24', price: 38.40 },
      { sku: 'ALC-005', name: 'Margarina Manty 500g', unit: 'caja x 12', price: 45.60 },
      { sku: 'ALC-006', name: 'Salsa de Tomate AlaCena 200g', unit: 'caja x 24', price: 72.00 },
    ],
  },
  {
    id: 'sup-002', name: 'Procter & Gamble Perú', category: 'Higiene', verified: true,
    location: 'Lima', min_order_amount: 3000, payment_terms: 'Contado', lead_time_days: 4,
    products: [
      { sku: 'PG-001', name: 'Ariel Líquido Doble Poder 2L', unit: 'caja x 6', price: 132.00 },
      { sku: 'PG-002', name: 'Pampers Recién Nacido x 40', unit: 'caja x 4', price: 148.00 },
      { sku: 'PG-003', name: 'Head & Shoulders Anti-Caspa 400ml', unit: 'caja x 12', price: 156.00 },
      { sku: 'PG-004', name: 'Gillette Prestobarba x 5', unit: 'display x 24', price: 84.00 },
    ],
  },
  {
    id: 'sup-003', name: 'Nestlé Perú S.A.', category: 'Alimentos', verified: true,
    location: 'Lima', min_order_amount: 8000, payment_terms: 'Crédito 60 días', lead_time_days: 5,
    products: [
      { sku: 'NST-001', name: 'Milo Actigen-E 400g', unit: 'caja x 12', price: 108.00 },
      { sku: 'NST-002', name: 'Nescafé Tradición 200g', unit: 'caja x 12', price: 192.00 },
      { sku: 'NST-003', name: 'Maggi Sazonador x 100un', unit: 'bolsa x 100', price: 38.00 },
      { sku: 'NST-004', name: 'Kit Kat 4 Fingers 41.5g', unit: 'display x 24', price: 76.80 },
      { sku: 'NST-005', name: 'Leche Gloria Evaporada 400g', unit: 'caja x 24', price: 115.20 },
    ],
  },
];

const MOCK_ORDERS = [
  {
    id: 'OC-2026-097', provider: 'Nestlé Perú S.A.', amount: 45000,
    status: 'aprobada', date: '2026-10-03', items: 5, paymentTerms: '60 días'
  },
  {
    id: 'OC-2026-094', provider: 'Procter & Gamble Perú', amount: 8250,
    status: 'enviada', date: '2026-10-02', items: 3, paymentTerms: 'Contado'
  },
  {
    id: 'OC-2026-091', provider: 'Alicorp S.A.A.', amount: 15400,
    status: 'recibida', date: '2026-09-28', items: 6, paymentTerms: '30 días'
  },
  {
    id: 'OC-2026-088', provider: 'Alicorp S.A.A.', amount: 9800,
    status: 'financiada', date: '2026-09-20', items: 4, paymentTerms: 'Línea KUOTA'
  },
];

type CartItem = { sku: string; name: string; unit: string; unitPrice: number; qty: number };

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  aprobada:   { label: 'Aprobada',   bg: 'var(--color-linen-mist)',  color: 'var(--color-spruce)' },
  enviada:    { label: 'Enviada',    bg: '#dbeafe',                   color: '#1d4ed8' },
  recibida:   { label: 'Recibida',   bg: 'var(--color-fog)',           color: 'var(--color-forest-ink)' },
  financiada: { label: 'Financiada', bg: 'var(--color-forest-ink)',   color: 'var(--color-lime-voltage)' },
};

// ── Inner Component ───────────────────────────────────────────────────────────
function ComprasContent() {
  const searchParams = useSearchParams();
  const preSelectedId = searchParams?.get('provider') || '';

  const [activeTab, setActiveTab] = useState<'nueva' | 'historial'>('nueva');
  const [selectedProviderId, setSelectedProviderId] = useState(preSelectedId || MOCK_PROVIDERS[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ocSent, setOcSent] = useState(false);
  const [selectedOC, setSelectedOC] = useState<any>(null);

  const selectedProvider = MOCK_PROVIDERS.find(p => p.id === selectedProviderId)!;

  const filteredProducts = useMemo(() =>
    selectedProvider.products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ), [selectedProvider, searchQuery]
  );

  const totalAmount = cart.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const meetsMinOrder = totalAmount >= selectedProvider.min_order_amount;
  const formatCurrency = (v: number) => `S/ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const addToCart = (product: (typeof selectedProvider.products)[0]) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.sku === product.sku);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { sku: product.sku, name: product.name, unit: product.unit, unitPrice: product.price, qty: 1 }];
    });
  };

  const updateQty = (sku: string, delta: number) => {
    setCart(prev => prev.map(c => c.sku === sku
      ? { ...c, qty: Math.max(1, c.qty + delta) }
      : c
    ));
  };

  const removeItem = (sku: string) => setCart(prev => prev.filter(c => c.sku !== sku));

  const handleSend = () => {
    if (cart.length === 0 || !meetsMinOrder) return;
    // In production: POST /api/dashboard/ordenes
    setOcSent(true);
    setTimeout(() => { setOcSent(false); setCart([]); setActiveTab('historial'); }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]"
            style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Órdenes de Compra
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-pebble)' }}>
            Crea y gestiona tus pedidos a proveedores en un solo lugar.
          </p>
        </div>
        <Link href="/financiamiento" className="wise-btn-outline flex items-center gap-2 !text-sm">
          <Landmark size={16} /> Financiar una OC
        </Link>
      </div>

      {/* Tabs */}
      <div className="wise-segmented">
        <button className={activeTab === 'nueva' ? 'active' : ''} onClick={() => setActiveTab('nueva')}>
          Nueva Orden
        </button>
        <button className={activeTab === 'historial' ? 'active' : ''} onClick={() => setActiveTab('historial')}>
          Historial ({MOCK_ORDERS.length})
        </button>
      </div>

      {/* ── NUEVA ORDEN ───────────────────────────────────────────────────── */}
      {activeTab === 'nueva' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Selector + Catálogo */}
          <div className="lg:col-span-7 space-y-5">

            {/* Selector de Proveedor */}
            <div className="wise-card !p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
                  Proveedor
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {MOCK_PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProviderId(p.id); setCart([]); setSearchQuery(''); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                    style={selectedProviderId === p.id
                      ? { background: 'var(--color-forest-ink)', color: 'var(--color-paper)', borderColor: 'var(--color-forest-ink)' }
                      : { background: 'transparent', color: 'var(--color-charcoal)', borderColor: 'var(--color-fog)' }
                    }
                  >
                    <Building2 size={14} />
                    {p.name}
                    {p.verified && <CheckCircle2 size={12} style={{ color: selectedProviderId === p.id ? 'var(--color-lime-voltage)' : '#16a34a' }} />}
                  </button>
                ))}
              </div>
              {selectedProvider && (
                <div className="px-5 py-3 border-t border-[var(--color-fog)] flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-pebble)' }}>
                  <span className="flex items-center gap-1"><Truck size={12} /> Lead Time: {selectedProvider.lead_time_days} días</span>
                  <span className="flex items-center gap-1"><Package size={12} /> Mínimo: {formatCurrency(selectedProvider.min_order_amount)}</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {selectedProvider.payment_terms}</span>
                </div>
              )}
            </div>

            {/* Catálogo */}
            <div className="wise-card !p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--color-fog)] flex items-center gap-3" style={{ background: 'var(--color-fog)' }}>
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
                  <input
                    type="search"
                    placeholder="Buscar SKU o producto…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="wise-input pl-9 !py-2 !text-sm"
                  />
                </div>
                <span className="wise-badge !text-xs">{selectedProvider.products.length} SKUs</span>
              </div>

              <div className="divide-y divide-[var(--color-fog)]">
                {filteredProducts.map(product => {
                  const inCart = cart.find(c => c.sku === product.sku);
                  return (
                    <div key={product.sku} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-fog)] transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-fog)' }}>
                        <Package size={16} style={{ color: 'var(--color-forest-ink)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: 'var(--color-obsidian)' }}>{product.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>
                          {product.sku} · {product.unit}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm" style={{ color: 'var(--color-obsidian)' }}>{formatCurrency(product.price)}</div>
                        <div className="text-xs" style={{ color: 'var(--color-pebble)' }}>por {product.unit}</div>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateQty(product.sku, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--color-fog)' }}>
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{inCart.qty}</span>
                          <button onClick={() => updateQty(product.sku, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--color-lime-voltage)' }}>
                            <Plus size={12} style={{ color: 'var(--color-forest-ink)' }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
                          style={{ background: 'var(--color-forest-ink)', color: 'var(--color-paper)' }}
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Carrito / Resumen OC */}
          <div className="lg:col-span-5">
            <div className="wise-card !p-0 overflow-hidden sticky top-6 shadow-xl">
              {/* Cart Header */}
              <div className="p-5 flex items-center gap-3" style={{ background: 'var(--color-forest-ink)' }}>
                <ShoppingCart size={20} style={{ color: 'var(--color-lime-voltage)' }} />
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-paper)' }}>
                  Resumen de Orden
                </h2>
                {cart.length > 0 && (
                  <span className="ml-auto wise-badge !text-xs" style={{ background: 'var(--color-lime-voltage)', color: 'var(--color-forest-ink)' }}>
                    {cart.length} SKUs
                  </span>
                )}
              </div>

              {/* Cart Body */}
              <div className="p-5">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={40} className="mx-auto mb-3" style={{ color: 'var(--color-pebble)', opacity: 0.3 }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                      Agrega productos del catálogo<br />para comenzar tu orden.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.sku} className="flex items-start gap-3 pb-3 border-b border-[var(--color-fog)]">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-obsidian)' }}>
                              {item.name}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>
                              {item.unit} · {formatCurrency(item.unitPrice)} c/u
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => updateQty(item.sku, -1)} className="w-6 h-6 rounded-full text-xs flex items-center justify-center" style={{ background: 'var(--color-fog)' }}>
                              <Minus size={10} />
                            </button>
                            <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                            <button onClick={() => updateQty(item.sku, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-lime-voltage)' }}>
                              <Plus size={10} style={{ color: 'var(--color-forest-ink)' }} />
                            </button>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-sm" style={{ color: 'var(--color-obsidian)' }}>
                              {formatCurrency(item.qty * item.unitPrice)}
                            </div>
                            <button onClick={() => removeItem(item.sku)} className="text-[10px] mt-0.5 font-semibold" style={{ color: 'var(--color-alarm-red)' }}>
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totales */}
                    <div className="pt-3 space-y-2">
                      <div className="flex justify-between text-sm" style={{ color: 'var(--color-pebble)' }}>
                        <span>Subtotal ({cart.reduce((a, c) => a + c.qty, 0)} unidades)</span>
                        <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black pt-2 border-t border-[var(--color-fog)]" style={{ color: 'var(--color-obsidian)' }}>
                        <span>TOTAL</span>
                        <span>{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>

                    {/* Aviso pedido mínimo */}
                    {!meetsMinOrder && totalAmount > 0 && (
                      <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: '#fff7ed', color: '#9a3412' }}>
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-tight">
                          Pedido mínimo: {formatCurrency(selectedProvider.min_order_amount)}. Te faltan {formatCurrency(selectedProvider.min_order_amount - totalAmount)}.
                        </p>
                      </div>
                    )}

                    {/* CTA Financiamiento */}
                    {meetsMinOrder && (
                      <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--color-linen-mist)' }}>
                        <div className="flex items-center gap-2">
                          <Landmark size={16} style={{ color: 'var(--color-forest-ink)' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                            ¿Necesitas financiar este pedido?
                          </span>
                        </div>
                        <Link href="/financiamiento" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-forest-ink)' }}>
                          Ver opciones <ChevronRight size={12} />
                        </Link>
                      </div>
                    )}

                    {/* Submit */}
                    {ocSent ? (
                      <div className="wise-btn-primary w-full justify-center !bg-[var(--color-spruce)] cursor-default">
                        <CheckCircle2 size={18} /> ¡OC Enviada Exitosamente!
                      </div>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={!meetsMinOrder || cart.length === 0}
                        className="wise-btn-primary w-full justify-center"
                        style={{ opacity: (!meetsMinOrder || cart.length === 0) ? 0.5 : 1 }}
                      >
                        <Send size={16} /> Generar Orden de Compra
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORIAL ─────────────────────────────────────────────────────── */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'OCs Este Mes', value: '4', sub: '+1 vs. mes anterior' },
              { label: 'Total Invertido', value: 'S/ 78,450', sub: 'Oct 2026' },
              { label: 'OCs Financiadas', value: '1', sub: 'Línea KUOTA activa' },
              { label: 'Prom. Lead Time', value: '4.2 días', sub: 'Todos los proveedores' },
            ].map(kpi => (
              <div key={kpi.label} className="wise-card !p-4">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>{kpi.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>{kpi.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabla de OCs */}
          <div className="wise-card !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)' }}>
              <h3 className="font-bold" style={{ color: 'var(--color-obsidian)' }}>Órdenes de Compra Recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>
                  <tr className="border-b border-[var(--color-fog)]">
                    <th className="px-6 py-3">ID Orden</th>
                    <th className="px-6 py-3">Proveedor</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Condición</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-fog)]">
                  {MOCK_ORDERS.map(order => {
                    const status = STATUS_CONFIG[order.status];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>{order.id}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{order.items} SKUs</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-sm" style={{ color: 'var(--color-charcoal)' }}>
                          {order.provider}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-pebble)' }}>
                          {order.date}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-pebble)' }}>
                          {order.paymentTerms}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-sm" style={{ color: 'var(--color-obsidian)' }}>
                          S/ {order.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="wise-badge !text-xs !px-3 !py-1"
                            style={{ background: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {order.status === 'aprobada' ? (
                            <Link href="/financiamiento" className="wise-btn-primary !px-3 !py-1.5 !text-xs flex items-center gap-1 justify-center">
                              <Landmark size={12} /> Financiar
                            </Link>
                          ) : (
                            <button 
                              onClick={() => setSelectedOC(order)}
                              className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-forest-ink)' }}>
                              Ver Detalle
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE DETALLE OC ───────────────────────────────────────────── */}
      {selectedOC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
             onClick={(e) => { if (e.target === e.currentTarget) setSelectedOC(null); }}>
          <div className="wise-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 p-6 relative">
            <button onClick={() => setSelectedOC(null)} className="absolute top-6 right-6 text-[var(--color-slate)] hover:text-[var(--color-obsidian)]">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[var(--color-obsidian)] mb-1">Orden de Compra {selectedOC.id}</h2>
            <div className="flex items-center gap-2 mb-6">
              <span className="wise-badge !text-xs !px-2 !py-0.5" style={{ background: STATUS_CONFIG[selectedOC.status].bg, color: STATUS_CONFIG[selectedOC.status].color }}>
                {STATUS_CONFIG[selectedOC.status].label}
              </span>
              <span className="text-xs text-[var(--color-slate)]">{selectedOC.date}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-[var(--color-fog)]">
                <p className="text-xs font-bold text-[var(--color-slate)] mb-1">PROVEEDOR</p>
                <p className="text-sm font-semibold text-[var(--color-obsidian)] flex items-center gap-2"><Building2 size={14} className="text-[var(--color-forest-ink)]" /> {selectedOC.provider}</p>
                <p className="text-xs text-[var(--color-charcoal)] mt-1">Contacto Registrado</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-white">
                <p className="text-xs font-bold text-[var(--color-slate)] mb-1">COMPRADOR (TÚ)</p>
                <p className="text-sm font-semibold text-[var(--color-obsidian)]">RUC: 20543189912</p>
                <p className="text-xs text-[var(--color-charcoal)] mt-1">Av. Javier Prado Este 456, San Isidro</p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-[var(--color-fog)]">
                <p className="text-xs font-bold text-[var(--color-slate)] mb-1">CONDICIÓN Y LOGÍSTICA</p>
                <p className="text-sm font-semibold text-[var(--color-obsidian)] flex items-center gap-2"><Truck size={14} className="text-[var(--color-forest-ink)]" /> {selectedOC.paymentTerms}</p>
                <p className="text-xs text-[var(--color-charcoal)] mt-1">Envío estándar - Almacén Central</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-[var(--color-obsidian)] mb-3">Productos Solicitados</h3>
              <div className="border border-[var(--color-fog)] rounded-[10px] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--color-fog)] text-[var(--color-slate)] text-xs font-bold">
                    <tr>
                      <th className="px-4 py-2">Producto</th>
                      <th className="px-4 py-2 text-right">Cant.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-fog)]">
                    <tr>
                      <td className="px-4 py-3 text-[var(--color-charcoal)]">Producto de ejemplo (SKU-1)</td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-obsidian)]">{selectedOC.items} u.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--color-fog)]">
                <span className="font-bold text-[var(--color-obsidian)]">Total de la Orden</span>
                <span className="font-black text-lg text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)' }}>
                  S/ {selectedOC.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-[var(--color-fog)]">
              <button onClick={() => setSelectedOC(null)} className="wise-btn-outline px-4">
                Cerrar
              </button>
              {selectedOC.status === 'enviada' && (
                <>
                  <button 
                    onClick={() => { alert('Función: Enviar mensaje de ajuste al comprador'); setSelectedOC(null); }}
                    className="wise-btn-outline px-4 flex items-center gap-2"
                  >
                    Solicitar Modificación
                  </button>
                  <button 
                    onClick={() => { alert('OC Aprobada'); setSelectedOC(null); }}
                    className="wise-btn-primary px-4 bg-[var(--color-spruce)]"
                  >
                    <CheckCircle2 size={16} className="inline mr-2" /> Aprobar OC
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Export con Suspense (useSearchParams requiere) ─────────────────────────────
export default function ComprasPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <div className="wise-spinner" />
      </div>
    }>
      <ComprasContent />
    </Suspense>
  );
}
