'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Tag,
  Search,
  SlidersHorizontal,
  Plus,
  Zap,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  Copy,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import { triggerNotificationRefresh } from '@/context/NotificationContext';
import { AppShell } from '@/components/layout/AppShell';

import { apiFetch } from '@/lib/apiFetch';
interface ProductItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  status: string;
  categoryId: string | null;
  category: string | null;
  subcategory: string | null;
  stock: number;
  safetyStock: number;
}

interface Kpis {
  total: number;
  categories: number;
  avgPrice: number;
  active: number;
}

const PAGE_SIZE = 10;

function formatPEN(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductsPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProductsIndex />
      </Suspense>
    </AppShell>
  );
}

function ProductsIndex() {
  const router = useRouter();
  const initialQ = useSearchQuery();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [kpis, setKpis] = useState<Kpis>({ total: 0, categories: 0, avgPrice: 0, active: 0 });
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [planLimit, setPlanLimit] = useState(500);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Sincronizar con ?q= (navegación desde categorías / buscador)
  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [fSku, setFSku] = useState('');
  const [fName, setFName] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fCost, setFCost] = useState('');
  const [fCategoryId, setFCategoryId] = useState('');
  const [fNewCategory, setFNewCategory] = useState('');
  const [fStock, setFStock] = useState('0');
  const [fSafety, setFSafety] = useState('0');

  const debouncedQuery = useDebounce(query, 300);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const atCap = kpis.total >= planLimit;
  const from = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(total, page * PAGE_SIZE);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQuery.trim(),
        category,
        status,
        sort: 'referencia',
        order: sortOrder,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await apiFetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
        setKpis(data.kpis || { total: 0, categories: 0, avgPrice: 0, active: 0 });
        if (data.categories) setCategories(data.categories);
        if (data.planLimit) setPlanLimit(data.planLimit);
        setSelected((prev) => prev.filter((sku) => (data.items || []).some((i: ProductItem) => i.sku === sku)));
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, category, status, sortOrder, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category, status]);

  const allSelected = items.length > 0 && items.every((i) => selected.includes(i.sku));

  const toggleSelect = (sku: string) => {
    setSelected((prev) => (prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]));
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((i) => i.sku));
  };

  const handleBulkOC = async () => {
    if (selected.length === 0 || bulkLoading) return;
    setBulkLoading(true);
    setBanner(null);
    try {
      const res = await apiFetch('/api/dashboard/reabastecimiento/oc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selected }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBanner({ type: 'success', text: data.summary || `Se procesaron ${data.count} órdenes.` });
        setSelected([]);
        triggerNotificationRefresh();
      } else {
        setBanner({ type: 'error', text: data.error || 'No se pudieron generar las órdenes.' });
      }
    } catch (err: any) {
      setBanner({ type: 'error', text: `Error de conexión: ${err.message}` });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDuplicateVariant = async (item: ProductItem) => {
    setBanner(null);
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: `${item.sku}-VAR`,
          name: `${item.name} (Variante)`,
          price: item.price,
          cost: item.cost,
          categoryId: item.categoryId || undefined,
          stock: 0,
          safetyStock: 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudo crear la variante.');
      const newId = data?.item?.id;
      setBanner({ type: 'success', text: `Variante ${data?.item?.sku_code || ''} creada. Complétala en su ficha.` });
      fetchProducts();
      if (newId) router.push(`/products/${newId}`);
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'No se pudo crear la variante.' });
    }
  };

  const resetForm = () => {
    setFSku('');
    setFName('');
    setFPrice('');
    setFCost('');
    setFCategoryId('');
    setFNewCategory('');
    setFStock('0');
    setFSafety('0');
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: fSku,
          name: fName,
          price: fPrice === '' ? NaN : Number(fPrice),
          cost: fCost === '' ? 0 : Number(fCost),
          categoryId: fCategoryId || undefined,
          categoryName: fCategoryId ? undefined : fNewCategory || undefined,
          stock: fStock === '' ? 0 : Number(fStock),
          safetyStock: fSafety === '' ? 0 : Number(fSafety),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo crear el producto.');
      }
      setShowModal(false);
      resetForm();
      setBanner({ type: 'success', text: `Producto ${data.item?.sku || ''} creado correctamente.` });
      fetchProducts();
    } catch (err: any) {
      setFormError(err?.message || 'No se pudo crear el producto.');
    } finally {
      setSaving(false);
    }
  };

  const kpiCards = useMemo(
    () => [
      { label: 'Total Productos', value: String(kpis.total) },
      { label: 'Categorías', value: String(kpis.categories) },
      { label: 'Promedio Venta', value: formatPEN(kpis.avgPrice) },
      { label: 'Tasa Activos', value: kpis.total > 0 ? `${Math.round((kpis.active / kpis.total) * 100)}%` : '0%' },
    ],
    [kpis]
  );

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)', letterSpacing: '-0.02em' }}>
            Catálogo General
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-charcoal)' }}>
            Administra tus productos, variantes y precios base.
          </p>
        </div>
      </div>

      {banner && (
        <div className={`p-4 rounded-[10px] text-sm font-semibold flex items-center justify-between ${banner.type === 'error' ? 'bg-[#fef2f2] text-[#991b1b] border border-[var(--color-alarm-red)]' : 'bg-[var(--color-linen-mist)] text-[var(--color-spruce)] border border-[var(--color-forest-ink)]'}`}>
          {banner.text}
          <button onClick={() => setBanner(null)}><X size={16} /></button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="wise-card !p-4 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-slate)' }}>{kpi.label}</span>
            <span className="text-xl font-black" style={{ color: 'var(--color-obsidian)' }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mt-6">
        <div className="relative flex-1 max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por SKU o nombre…"
            className="w-full wise-input pl-4 pr-10 !py-2.5"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} />
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center justify-center p-2.5 rounded-xl border transition-colors"
            style={{ 
              background: category !== 'all' || status !== 'all' ? 'var(--color-linen-mist)' : '#ffffff',
              borderColor: category !== 'all' || status !== 'all' ? 'var(--color-forest-ink)' : 'var(--color-fog)',
              color: 'var(--color-charcoal)' 
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
          
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-[var(--color-fog)] rounded-[10px] shadow-xl p-4 z-50 w-64 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>CATEGORÍA</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="wise-input w-full !py-2">
                  <option value="all">Todas</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>ESTADO</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="wise-input w-full !py-2">
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="paused">Pausados</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={atCap}
          className="wise-btn-primary ml-auto flex items-center gap-2"
          style={atCap ? { background: 'var(--color-pebble)', cursor: 'not-allowed' } : {}}
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo Producto</span>
        </button>
      </div>

      {/* Barra de Selección Masiva */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 bg-[var(--color-linen-mist)] border border-[var(--color-forest-ink)] rounded-[10px] p-3 text-sm font-bold text-[var(--color-forest-ink)]">
          <span>{selected.length} seleccionado{selected.length !== 1 && 's'}</span>
          <button
            onClick={handleBulkOC}
            disabled={bulkLoading}
            className="px-4 py-1.5 rounded-full text-white ml-2 text-xs transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-obsidian)', cursor: bulkLoading ? 'not-allowed' : 'pointer' }}
          >
            {bulkLoading ? 'Generando...' : 'Generar OC'}
          </button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs hover:underline">Limpiar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="wise-card !p-0 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--color-fog)] border-b border-[var(--color-fog)]">
            <tr>
              <th className="px-5 py-4 w-10">
                <input 
                  type="checkbox" checked={allSelected} onChange={toggleSelectAll} 
                  className="w-4 h-4 cursor-pointer accent-[var(--color-forest-ink)]" 
                />
              </th>
              <th className="px-4 py-4">
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:text-[var(--color-obsidian)] transition-colors"
                  style={{ color: 'var(--color-slate)' }}
                >
                  REFERENCIA {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </th>
              <th className="px-4 py-4 w-12 text-[var(--color-pebble)]"><ImageIcon size={18} /></th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Nombre</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Precio</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Categoría</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Stock</th>
              <th className="px-4 py-4 text-right text-[var(--color-forest-ink)]"><Zap size={18} className="ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-fog)]">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>Cargando catálogo...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>No se encontraron productos.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--color-fog)] transition-colors group">
                  <td className="px-5 py-3">
                    <input 
                      type="checkbox" checked={selected.includes(item.sku)} onChange={() => toggleSelect(item.sku)}
                      className="w-4 h-4 cursor-pointer accent-[var(--color-forest-ink)]" 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-md text-xs font-mono font-bold bg-[var(--color-fog)] text-[var(--color-charcoal)]">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-fog)] border border-[var(--color-pebble)]/20 flex items-center justify-center text-[var(--color-pebble)]">
                      <Tag size={16} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>
                    <Link href={`/products/${item.id}`} className="hover:underline">{item.name}</Link>
                  </td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>
                    {formatPEN(item.price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
                    {item.category || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--color-obsidian)' }}>
                    {item.stock}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDuplicateVariant(item)}
                      title="Crear variante a partir de este"
                      className="p-2 rounded-full hover:bg-white text-[var(--color-slate)] hover:text-[var(--color-forest-ink)] transition-colors inline-flex"
                    >
                      <Copy size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Paginación */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-fog)] text-sm font-medium" style={{ color: 'var(--color-slate)' }}>
            <span>Mostrando {from}–{to} de {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: 'var(--color-fog)', color: 'var(--color-charcoal)' }}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: 'var(--color-fog)', color: 'var(--color-charcoal)' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget && !saving) setShowModal(false); }}>
          <form onSubmit={handleCreate} className="wise-card w-full max-w-lg shadow-2xl animate-in zoom-in-95 p-6 flex flex-col gap-4">
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-obsidian)' }}>Nuevo Producto</h2>
              <button type="button" onClick={() => !saving && setShowModal(false)} className="text-[var(--color-slate)] hover:text-[var(--color-obsidian)]">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl text-sm font-bold bg-[#fef2f2] text-[#991b1b] border border-[var(--color-alarm-red)]">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Referencia (SKU) *</label>
                <input value={fSku} onChange={e => setFSku(e.target.value)} placeholder="SKU-001" required className="wise-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Precio (S/) *</label>
                <input value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="0.00" required className="wise-input w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Nombre del Producto *</label>
              <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Ej. Zapatillas Running" required className="wise-input w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Categoría</label>
                <select value={fCategoryId} onChange={e => setFCategoryId(e.target.value)} className="wise-input w-full">
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Nueva Categoría</label>
                <input value={fNewCategory} onChange={e => setFNewCategory(e.target.value)} placeholder="O crear..." disabled={!!fCategoryId} className="wise-input w-full disabled:opacity-50" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Costo</label>
                <input value={fCost} onChange={e => setFCost(e.target.value)} placeholder="0.00" className="wise-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Stock inicial</label>
                <input value={fStock} onChange={e => setFStock(e.target.value)} placeholder="0" className="wise-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-charcoal)' }}>Stock mínimo</label>
                <input value={fSafety} onChange={e => setFSafety(e.target.value)} placeholder="5" className="wise-input w-full" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button type="button" onClick={() => !saving && setShowModal(false)} className="wise-btn-outline px-6">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="wise-btn-primary px-6 flex items-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Guardando...' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
