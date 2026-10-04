'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, TrendingDown, AlertCircle, Calculator, CalendarDays } from 'lucide-react';

export default function MiAlmacenPage() {
  const [filterState, setFilterState] = useState<'todos' | 'quiebre' | 'sobre_stock'>('quiebre');
  const [rematePercent, setRematePercent] = useState<number>(30);
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?pageSize=100')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const formatted = data.items.map((p: any) => {
            const isQuiebre = p.stock <= (p.safetyStock || 0);
            const isSobreStock = p.stock > (p.safetyStock || 5) * 3;
            const status = isQuiebre ? 'quiebre' : isSobreStock ? 'sobre_stock' : 'normal';
            
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

  const filteredProducts = products.filter(p => {
    if (filterState === 'quiebre') return p.status === 'quiebre';
    if (filterState === 'sobre_stock') return p.status === 'sobre_stock';
    return true;
  });

  const totalDeadInventory = products.reduce((acc, p) => acc + (p.deadInventoryValue || 0), 0);
  const recoveredValue = totalDeadInventory * (1 - (rematePercent / 100));
  const avgCostPerDay = 500;
  const additionalDays = Math.floor(recoveredValue / avgCostPerDay);
  
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.totalStock), 0);
  const totalProducts = products.length;
  const totalVariants = products.filter(p => p.sku.includes('-')).length || Math.floor(products.length * 1.5);

  return (
    <div className="p-8 pb-32 max-w-[1200px] mx-auto min-h-screen bg-[var(--color-fog)]">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)', letterSpacing: '-0.02em' }}>
          Mi Almacén
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-charcoal)' }}>
          Catálogo general, control de SKUs e inventario inmovilizado.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="wise-card !p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-slate)' }}>Valor Inventario</p>
            <h3 className="text-2xl font-black" style={{ color: 'var(--color-obsidian)' }}>S/ {totalValue.toLocaleString()}</h3>
          </div>
          <div className="p-3 rounded-full" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
            <Calculator size={20} />
          </div>
        </div>
        <div className="wise-card !p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-slate)' }}>Total Productos</p>
            <h3 className="text-2xl font-black" style={{ color: 'var(--color-obsidian)' }}>{totalProducts}</h3>
          </div>
          <div className="p-3 rounded-full" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
            <Search size={20} />
          </div>
        </div>
        <div className="wise-card !p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-slate)' }}>Variantes Activas</p>
            <h3 className="text-2xl font-black" style={{ color: 'var(--color-obsidian)' }}>{totalVariants}</h3>
          </div>
          <div className="p-3 rounded-full" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
            <Plus size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTADO Y FILTROS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wise-card !p-0 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[var(--color-fog)] flex items-center justify-between">
              
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-xs uppercase tracking-wider" style={{ background: 'var(--color-fog)', color: 'var(--color-slate)' }}>
                  <tr>
                    <th className="px-6 py-4 font-bold">SKU / Producto</th>
                    <th className="px-6 py-4 font-bold">Categoría</th>
                    <th className="px-6 py-4 font-bold text-right">Precio</th>
                    <th className="px-6 py-4 font-bold text-right">Cantidad</th>
                    <th className="px-6 py-4 font-bold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-fog)]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                        Cargando inventario...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                        No hay productos en esta vista.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[var(--color-fog)] transition-colors group cursor-pointer" onClick={() => window.location.href = `/products/${product.id}`}>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-medium mb-1" style={{ color: 'var(--color-slate)' }}>{product.sku}</div>
                          <div className="font-bold text-sm" style={{ color: 'var(--color-obsidian)' }}>{product.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
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
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#fecaca', color: 'var(--color-alarm-red)' }}>
                              <AlertCircle size={14} /> Quiebre
                            </span>
                          ) : product.status === 'sobre_stock' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#b45309' }}>
                              <TrendingDown size={14} /> Exceso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-spruce)' }}>
                              Normal
                            </span>
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

        {/* INVENTARIO MUERTO Y REMATES */}
        <div className="space-y-6">
          <div className="wise-card-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <TrendingDown size={100} />
            </div>
            
            <h2 className="font-bold flex items-center gap-2 mb-3 text-lg" style={{ color: 'var(--color-lime-voltage)' }}>
              <TrendingDown size={20} />
              Inventario Muerto
            </h2>
            <p className="text-sm mb-6 text-white opacity-80 leading-relaxed">
              Capital inmovilizado en productos de baja rotación. Libéralo para compras estratégicas.
            </p>
            
            <div className="mb-8">
              <span className="text-4xl font-black block" style={{ fontFamily: 'var(--font-wise-sans)', color: 'white' }}>
                S/ {totalDeadInventory.toLocaleString()}
              </span>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="font-bold text-sm mb-4 text-white flex items-center gap-2">
                <Calculator size={16} style={{ color: 'var(--color-lime-voltage)' }} />
                Calculadora de Remates
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 text-white opacity-80 uppercase tracking-wide">
                    <span>Descuento de Remate</span>
                    <span style={{ color: 'var(--color-lime-voltage)' }}>{rematePercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="80" step="5"
                    value={rematePercent}
                    onChange={(e) => setRematePercent(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                    style={{ background: 'var(--color-spruce)' }}
                  />
                </div>

                <div className="bg-white p-5 rounded-[10px] shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Capital Recuperado</span>
                  </div>
                  <div className="text-xl font-black mb-4" style={{ color: 'var(--color-forest-ink)' }}>
                    S/ {recoveredValue.toLocaleString()}
                  </div>
                  
                  {/* Proyección Interactiva */}
                  <div className="flex items-start gap-3 pt-4 border-t border-[var(--color-fog)]">
                    <CalendarDays size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--color-spruce)' }} />
                    <div>
                      <span className="font-bold text-sm block" style={{ color: 'var(--color-forest-ink)' }}>+{additionalDays} Días</span>
                      <span className="text-xs font-medium leading-tight block mt-1" style={{ color: 'var(--color-charcoal)' }}>
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
