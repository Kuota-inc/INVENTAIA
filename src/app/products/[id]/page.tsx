'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  Pencil,
  Zap,
  Tag,
  Building2,
  Boxes,
  X,
  TrendingUp,
} from 'lucide-react';
import { triggerNotificationRefresh } from '@/context/NotificationContext';
import { AppShell } from '@/components/layout/AppShell';

import { apiFetch } from '@/lib/apiFetch';
interface DetailData {
  item: {
    id: string;
    sku: string;
    name: string;
    price: number;
    cost: number;
    margin: number;
    status: string;
    categoryId: string | null;
    category: string | null;
    updatedAt: string;
  };
  stock: { physical: number; safety: number };
  supplier: { id: string; name: string; type: string; phone: string | null; leadTimeDays: number } | null;
  restock: {
    rop: number;
    coverageDays: number;
    suggestedQty: number;
    investment: number;
    status: string;
    dailyVelocity: number;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    condition: string;
    total: number;
    status: string;
    createdAt: string;
    lines: Array<{ quantity: number; unitPrice: number }>;
  }>;
}

function formatPEN(n: number): string {
  return `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)', label: 'Activo' },
  paused: { bg: '#fef2f2', color: 'var(--color-alarm-red)', label: 'Pausado' },
  critical: { bg: '#fef2f2', color: 'var(--color-alarm-red)', label: 'Crítico' },
  warning: { bg: '#fffbeb', color: '#b45309', label: 'Alerta' },
  optimal: { bg: 'var(--color-linen-mist)', color: 'var(--color-spruce)', label: 'Normal' },
};

export default function ProductDetailPage() {
  return (
    <AppShell>
      <ProductDetailContent />
    </AppShell>
  );
}

function ProductDetailContent() {
  const params = useParams();
  const id = decodeURIComponent(String(params?.id || ''));

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generating, setGenerating] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fName, setFName] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fCost, setFCost] = useState('');
  const [fStatus, setFStatus] = useState('active');
  const [fStock, setFStock] = useState('');
  const [fSafety, setFSafety] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/products/${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error('Error de red');
      const json = await res.json();
      setData(json);
      setFName(json.item.name);
      setFPrice(String(json.item.price));
      setFCost(String(json.item.cost));
      setFStatus(json.item.status);
      setFStock(String(json.stock.physical));
      setFSafety(String(json.stock.safety));
    } catch (err) {
      console.error(err);
      setBanner({ type: 'error', text: 'Error al cargar detalles' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerateOC = async () => {
    if (!data || generating) return;
    setGenerating(true);
    setBanner(null);
    try {
      const res = await apiFetch('/api/dashboard/reabastecimiento/oc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: [data.item.sku] }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setBanner({ type: 'success', text: `Se generó OC por ${data.restock.suggestedQty} u. de este SKU.` });
        triggerNotificationRefresh();
        load();
      } else {
        setBanner({ type: 'error', text: resData.error || 'No se pudo generar la OC.' });
      }
    } catch (err) {
      setBanner({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setFormError(null);
    setSaving(true);
    try {
      const res = await apiFetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fName,
          price: Number(fPrice),
          cost: Number(fCost),
          status: fStatus,
          stock: Number(fStock),
          safetyStock: Number(fSafety),
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData.error || 'No se guardaron los cambios');
      setShowEdit(false);
      setBanner({ type: 'success', text: 'Producto actualizado.' });
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-pebble)] text-sm font-medium">Cargando datos...</div>;
  }

  if (notFound || !data) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto text-center mt-20">
        <h1 className="text-2xl font-bold text-[var(--color-obsidian)] mb-2">Producto no encontrado</h1>
        <p className="text-[var(--color-slate)] mb-6">El producto con ID {id} no existe o fue eliminado.</p>
        <Link href="/products/products" className="wise-btn-primary inline-block">Volver al catálogo</Link>
      </div>
    );
  }

  const stockPct = data.stock.safety > 0 ? (data.stock.physical / data.stock.safety) * 100 : 100;
  const coveragePct = Math.min(100, Math.max(0, (data.restock.coverageDays / 30) * 100));

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 pb-32 space-y-6">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-slate)]">
        <Link href="/products/products" className="hover:text-[var(--color-obsidian)] hover:underline">Catálogo</Link>
        <ChevronRight size={14} />
        <span className="text-[var(--color-charcoal)]">{data.item.sku}</span>
      </div>

      {banner && (
        <div className={`p-4 rounded-[10px] text-sm font-semibold flex items-center justify-between ${banner.type === 'error' ? 'bg-[#fef2f2] text-[#991b1b] border border-[var(--color-alarm-red)]' : 'bg-[var(--color-linen-mist)] text-[var(--color-spruce)] border border-[var(--color-forest-ink)]'}`}>
          {banner.text}
          <button onClick={() => setBanner(null)}><X size={16} /></button>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3">
          <div className="flex items-center gap-3 mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-slate)]">
            <span className="flex items-center gap-1"><Tag size={14} /> {data.item.category || 'Sin categoría'}</span>
            <span>•</span>
            <span
              className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{ background: STATUS_STYLE[data.item.status]?.bg, color: STATUS_STYLE[data.item.status]?.color }}
            >
              {STATUS_STYLE[data.item.status]?.label || data.item.status}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[var(--color-obsidian)] leading-tight tracking-[-0.03em] mb-4">
            {data.item.name}
          </h1>
          <p className="text-lg text-[var(--color-charcoal)] font-mono font-bold mb-6">SKU: {data.item.sku}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="wise-btn-outline flex items-center gap-2"
            >
              <Pencil size={16} /> Editar Producto
            </button>
            <button
              onClick={handleGenerateOC}
              disabled={generating || data.restock.suggestedQty <= 0}
              className="wise-btn-primary flex items-center gap-2"
              style={data.restock.suggestedQty <= 0 ? { background: 'var(--color-pebble)', cursor: 'not-allowed' } : {}}
            >
              <Zap size={16} /> 
              {generating ? 'Generando...' : data.restock.suggestedQty > 0 ? `Generar OC (${data.restock.suggestedQty}u)` : 'Stock óptimo'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Precios y Margen */}
        <div className="wise-card">
          <h2 className="text-sm font-bold text-[var(--color-obsidian)] mb-4 flex items-center gap-2">
            <Tag size={16} className="text-[var(--color-forest-ink)]" /> Financiero
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-fog)]">
              <span className="text-sm text-[var(--color-slate)]">Precio de venta</span>
              <strong className="text-[var(--color-obsidian)] font-bold">{formatPEN(data.item.price)}</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-fog)]">
              <span className="text-sm text-[var(--color-slate)]">Costo de compra</span>
              <strong className="text-[var(--color-obsidian)] font-bold">{formatPEN(data.item.cost)}</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-fog)]">
              <span className="text-sm text-[var(--color-slate)]">Margen unitario</span>
              <strong className="text-[var(--color-forest-ink)] font-bold">{formatPEN(data.item.margin)}</strong>
            </div>
          </div>
        </div>

        {/* Proveedor */}
        <div className="wise-card">
          <h2 className="text-sm font-bold text-[var(--color-obsidian)] mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-[var(--color-forest-ink)]" /> Proveedor Asociado
          </h2>
          {data.supplier ? (
            <div className="space-y-3">
              <div className="font-bold text-[var(--color-obsidian)] text-lg mb-1">{data.supplier.name}</div>
              <div className="text-sm text-[var(--color-slate)]">
                {data.supplier.type === 'international' ? 'Internacional' : 'Local'} • {data.supplier.leadTimeDays} días de envío
              </div>
              <div className="text-sm text-[var(--color-charcoal)] font-medium">Contact: {data.supplier.phone || 'No registrado'}</div>
              <Link href={`/proveedores/${data.supplier.id}`} className="text-sm text-[var(--color-forest-ink)] font-bold hover:underline block mt-2">
                Ver proveedor &rarr;
              </Link>
            </div>
          ) : (
            <div className="text-sm text-[var(--color-pebble)] py-4">No hay proveedor primario asignado a este producto.</div>
          )}
        </div>

        {/* Stock y Reposición */}
        <div className="wise-card-dark bg-[var(--color-forest-ink)] text-white">
          <h2 className="text-sm font-bold text-[var(--color-lime-voltage)] mb-4 flex items-center gap-2">
            <Boxes size={16} /> Stock y Reposición
          </h2>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${coveragePct}%`, 
                background: data.restock.status === 'critical' ? 'var(--color-alarm-red)' : data.restock.status === 'warning' ? '#f59e0b' : 'var(--color-lime-voltage)' 
              }} 
            />
          </div>
          <div className="space-y-2">
            {[
              ['Stock físico', `${data.stock.physical} u`],
              ['Stock seguridad', `${data.stock.safety} u`],
              ['Punto reorden', `${data.restock.rop} u`],
              ['Velocidad est.', `${data.restock.dailyVelocity} u/día`],
              ['Compra sugerida', `${data.restock.suggestedQty} u`]
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center text-sm py-1 border-b border-white/10 last:border-0">
                <span className="text-white/70">{k}</span>
                <strong className="font-bold tabular-nums">{v}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Historial OC */}
      <div className="wise-card mt-6">
        <h2 className="text-sm font-bold text-[var(--color-obsidian)] mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--color-forest-ink)]" /> Historial de Órdenes ({data.orders.length})
        </h2>
        {data.orders.length === 0 ? (
          <p className="text-sm text-[var(--color-pebble)] py-4">Aún no hay órdenes de compra para este SKU.</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {data.orders.map((o) => (
              <div key={o.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-[var(--color-fog)] rounded-[10px] p-3 text-sm">
                <strong className="text-[var(--color-obsidian)] min-w-24">{o.orderNumber}</strong>
                <span className="text-[var(--color-slate)] flex-1">
                  {o.lines.reduce((a, l) => a + l.quantity, 0)} u · S/ {o.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full w-fit"
                  style={{
                    background: o.status === 'sent' ? 'var(--color-linen-mist)' : 'var(--color-fog)',
                    color: o.status === 'sent' ? 'var(--color-spruce)' : 'var(--color-slate)',
                  }}
                >
                  {o.status === 'sent' ? 'ENVIADA' : 'BORRADOR'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget && !saving) setShowEdit(false); }}>
          <form onSubmit={handleSave} className="wise-card w-full max-w-lg shadow-2xl animate-in zoom-in-95 p-6 flex flex-col gap-4">
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--color-obsidian)]">Editar {data.item.sku}</h2>
              <button type="button" onClick={() => !saving && setShowEdit(false)} className="text-[var(--color-slate)] hover:text-[var(--color-obsidian)]">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl text-sm font-bold bg-[#fef2f2] text-[#991b1b] border border-[var(--color-alarm-red)]">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Nombre *</label>
              <input value={fName} onChange={e => setFName(e.target.value)} required className="wise-input w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Precio (S/) *</label>
                <input value={fPrice} onChange={e => setFPrice(e.target.value)} required className="wise-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Costo (S/)</label>
                <input value={fCost} onChange={e => setFCost(e.target.value)} className="wise-input w-full" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Estado</label>
                <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="wise-input w-full">
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Stock físico</label>
                <input value={fStock} onChange={e => setFStock(e.target.value)} className="wise-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-charcoal)]">Stock mín.</label>
                <input value={fSafety} onChange={e => setFSafety(e.target.value)} className="wise-input w-full" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button type="button" onClick={() => !saving && setShowEdit(false)} className="wise-btn-outline px-6">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="wise-btn-primary px-6 flex items-center gap-2">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
