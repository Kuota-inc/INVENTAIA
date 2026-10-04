'use client';

import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, ArrowDownToLine, AlertCircle, TrendingDown, DollarSign, Calculator, CalendarDays } from 'lucide-react';
import Link from 'next/link';

// Datos calculados dinámicamente desde Supabase


export default function MiAlmacenPage() {
  const [filterState, setFilterState] = useState<'todos' | 'quiebre' | 'sobre_stock'>('quiebre'); // Por defecto quiebre
  const [rematePercent, setRematePercent] = useState<number>(30); // 30% por defecto
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/products?pageSize=100')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const formatted = data.items.map((p: any) => {
            const isQuiebre = p.stock <= (p.safetyStock || 0);
            const isSobreStock = p.stock > (p.safetyStock || 5) * 3;
            const status = isQuiebre ? 'quiebre' : isSobreStock ? 'sobre_stock' : 'normal';
            
            // Calculo rápido de inventario inmovilizado (solo si es sobre_stock)
            const deadInventoryValue = status === 'sobre_stock' ? (p.stock - (p.safetyStock || 5)) * p.price : 0;

            return {
              id: p.id,
              sku: p.sku,
              name: p.name,
              category: p.category || 'General',
              price: p.price,
              totalStock: p.stock,
              minStock: p.safetyStock,
              status,
              deadInventoryValue
            };
          });
          setProducts(formatted);
        }
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  // Totales
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.totalStock), 0);
  const totalProducts = products.length;
  const totalVariants = products.length; // 1-1 en este MVP
  const totalDeadInventory = products.reduce((acc, p) => acc + p.deadInventoryValue, 0);

  // Filtro
  const filteredProducts = products
    .filter(p => filterState === 'todos' ? true : p.status === filterState)
    .sort((a, b) => a.status === 'quiebre' ? -1 : 1); // Priorizar quiebres siempre arriba

  // Calculadora de Remate
  const recoveredValue = totalDeadInventory * (rematePercent / 100);
  const additionalDays = Math.floor(recoveredValue / 1500); // Simulando que el gasto diario promedio es 1500

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Mi Almacén
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-pebble)' }}>
            Gestión de SKUs, subidas y análisis de inventario muerto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/inventory/stock-adjustments" className="wise-btn-outline !py-2" style={{ textDecoration: 'none' }}>
            <SlidersHorizontal size={18} /> Ajustes de Backlog
          </Link>
          <Link href="/inventory/imports" className="wise-btn-outline !py-2" style={{ textDecoration: 'none' }}>
            <ArrowDownToLine size={18} /> Subir SKUs
          </Link>
          <Link href="/products/products" className="wise-btn-primary !py-2" style={{ textDecoration: 'none' }}>
            <Plus size={18} /> Nuevo Producto
          </Link>
        </div>
      </div>

      {/* 4.3 Resumen Ejecutivo (Chips Superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wise-card !p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-slate)' }}>Valor Total a PV</p>
            <h3 className="text-xl font-black mt-1" style={{ color: 'var(--color-obsidian)' }}>S/ {totalValue.toLocaleString()}</h3>
          </div>
          <div className="p-2 rounded-full" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)' }}><DollarSign size={20}/></div>
        </div>
        <div className="wise-card !p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-slate)' }}>Total SKUs</p>
            <h3 className="text-xl font-black mt-1" style={{ color: 'var(--color-obsidian)' }}>{totalProducts}</h3>
          </div>
          <div className="p-2 rounded-full" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}><Search size={20}/></div>
        </div>
        <div className="wise-card !p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-slate)' }}>Variantes Activas</p>
            <h3 className="text-xl font-black mt-1" style={{ color: 'var(--color-obsidian)' }}>{totalVariants}</h3>
          </div>
          <div className="p-2 rounded-full" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}><Plus size={20}/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4.1 y 4.5 Listado y Filtros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wise-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-fog)] flex items-center justify-between">
              
              {/* Conmutador de Estado */}
              <div className="wise-segmented">
                <button 
                  onClick={() => setFilterState('todos')}
                  className={filterState === 'todos' ? 'active' : ''}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilterState('quiebre')}
                  className={filterState === 'quiebre' ? 'active' : ''}
                  style={filterState === 'quiebre' ? { background: 'var(--color-alarm-red)', color: 'white' } : {}}
                >
                  Quiebres
                </button>
                <button 
                  onClick={() => setFilterState('sobre_stock')}
                  className={filterState === 'sobre_stock' ? 'active' : ''}
                >
                  Sobre Stock
                </button>
              </div>

            </div>

            <table className="w-full text-left">
              <thead className="text-sm border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
                <tr>
                  <th className="px-6 py-4 font-semibold">SKU / Producto</th>
                  <th className="px-6 py-4 font-semibold">Categoría</th>
                  <th className="px-6 py-4 font-semibold text-right">Precio</th>
                  <th className="px-6 py-4 font-semibold text-right">Cantidad</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-fog)]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--color-fog)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs" style={{ color: 'var(--color-pebble)' }}>{product.sku}</div>
                      <div className="font-bold mt-0.5" style={{ color: 'var(--color-obsidian)' }}>{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-charcoal)' }}>
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right" style={{ color: 'var(--color-obsidian)' }}>
                      S/ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right" style={{ color: 'var(--color-obsidian)' }}>
                      {product.totalStock}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.status === 'quiebre' ? (
                        <span className="wise-badge gap-1.5" style={{ background: '#fecaca', color: 'var(--color-alarm-red)' }}>
                          <AlertCircle size={14} /> Quiebre
                        </span>
                      ) : (
                        <span className="wise-badge gap-1.5" style={{ background: '#fef3c7', color: '#b45309' }}>
                          <TrendingDown size={14} /> Sobre Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                      No hay productos en esta vista.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4.4 Inventario Muerto y Remates */}
        <div className="space-y-6">
          <div className="wise-card-dark">
            <h2 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--color-lime-voltage)' }}>
              <TrendingDown size={20} />
              Inventario Muerto
            </h2>
            <p className="text-sm mb-6 text-white opacity-80">Capital inmovilizado en productos de baja rotación.</p>
            
            <div className="mb-6">
              <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'white' }}>
                S/ {totalDeadInventory.toLocaleString()}
              </span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="font-semibold text-sm mb-3 text-white flex items-center gap-2">
                <Calculator size={16} style={{ color: 'var(--color-lime-voltage)' }} />
                Calculadora de Remates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-white opacity-80">
                    <span>Descuento de Remate</span>
                    <span className="font-bold" style={{ color: 'var(--color-lime-voltage)' }}>{rematePercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="80" step="5"
                    value={rematePercent}
                    onChange={(e) => setRematePercent(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'var(--color-spruce)' }}
                  />
                </div>

                <div className="bg-white p-4 rounded-[10px] space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold" style={{ color: 'var(--color-pebble)' }}>Capital Recuperado:</span>
                    <span className="font-bold" style={{ color: 'var(--color-forest-ink)' }}>S/ {recoveredValue.toLocaleString()}</span>
                  </div>
                  
                  {/* Proyección Interactiva */}
                  <div className="flex items-start gap-3 pt-3 border-t border-[var(--color-fog)]">
                    <CalendarDays size={24} style={{ color: 'var(--color-spruce)' }} />
                    <div>
                      <span className="font-bold block" style={{ color: 'var(--color-forest-ink)' }}>+{additionalDays} Días</span>
                      <span className="text-xs leading-tight block mt-1" style={{ color: 'var(--color-charcoal)' }}>
                        De inventario sano adicional que podrías comprar hoy.
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
