'use client';

import React, { useState } from 'react';
import { Search, AlertCircle, ShoppingCart, TrendingDown, ArrowRight, PackageX } from 'lucide-react';
import Link from 'next/link';

// La data ahora proviene del backend (Supabase) a través del API.


export default function StockAlertsPage() {
  const [filterState, setFilterState] = useState<'quiebre' | 'sobre_stock'>('quiebre');
  const [cart, setCart] = useState<string[]>([]); // Array of item IDs to buy
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch('/api/dashboard/reabastecimiento')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          // Si el backend no envía los nuevos campos de MVP v1.0, simulamos fallback por ahora 
          // hasta que corran el SQL de migración y se actualice el servicio de restock
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            available: item.currentStock || 0,
            daysLeft: item.daysLeft || item.coverageDays || 0,
            lostSalesRisk: item.lostSalesRisk || (item.status === 'critical' ? 1500 : 0),
            inventoryValue: item.inventoryValue || item.investment || 0,
            status: item.status === 'critical' || item.coverageDays <= 5 ? 'quiebre' : 'sobre_stock'
          }));
          setAlerts(formatted);
        }
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const filteredAlerts = alerts.filter(a => a.status === filterState);

  const toggleCart = (id: string) => {
    setCart(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Monitor de Riesgos y Quiebres
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-pebble)' }}>
            Detecta quiebres de inventario, estima pérdidas de ventas y genera órdenes de compra al instante.
          </p>
        </div>
        
        {/* Carrito de Compras Flotante (Botón) */}
        {cart.length > 0 && (
          <Link 
            href="/compras"
            className="wise-btn-primary !py-3 flex items-center gap-2 animate-in slide-in-from-right"
          >
            <ShoppingCart size={20} />
            Generar OC ({cart.length}) <ArrowRight size={18} />
          </Link>
        )}
      </div>

      <div className="wise-card !p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--color-fog)] flex items-center justify-between">
          
          {/* Conmutador de Estado */}
          <div className="flex p-1 rounded-lg" style={{ background: 'var(--color-fog)' }}>
            <button 
              onClick={() => setFilterState('quiebre')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${filterState === 'quiebre' ? 'bg-white shadow-sm text-[var(--color-alarm-red)]' : 'text-[var(--color-pebble)]'}`}
            >
              <div className="flex items-center gap-2"><PackageX size={16}/> Riesgo de Quiebre</div>
            </button>
            <button 
              onClick={() => setFilterState('sobre_stock')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${filterState === 'sobre_stock' ? 'bg-white shadow-sm text-amber-600' : 'text-[var(--color-pebble)]'}`}
            >
               <div className="flex items-center gap-2"><TrendingDown size={16}/> Sobre Stock</div>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} size={20} />
            <input 
              type="text" 
              placeholder="Buscar SKU..." 
              className="wise-input pl-10"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="text-sm border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
            <tr>
              <th className="px-6 py-4 font-semibold">SKU / Producto</th>
              <th className="px-6 py-4 font-semibold text-right">Cant. Disponible</th>
              <th className="px-6 py-4 font-semibold text-right">Días Restantes</th>
              <th className="px-6 py-4 font-semibold text-right">Valor Inventario</th>
              {filterState === 'quiebre' && (
                <th className="px-6 py-4 font-semibold text-right" style={{ color: 'var(--color-alarm-red)' }}>Riesgo Venta Perdida</th>
              )}
              <th className="px-6 py-4 font-semibold text-center">Acción rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-fog)]">
            {filteredAlerts.map((item) => {
              const inCart = cart.includes(item.id);
              
              return (
                <tr key={item.id} className="hover:bg-[var(--color-fog)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs" style={{ color: 'var(--color-pebble)' }}>{item.sku}</div>
                    <div className="font-bold mt-0.5" style={{ color: 'var(--color-obsidian)' }}>{item.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right" style={{ color: 'var(--color-obsidian)' }}>
                    {item.available} u.
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right" style={{ color: 'var(--color-obsidian)' }}>
                    {item.daysLeft <= 3 ? (
                      <span className="text-[var(--color-alarm-red)]">{item.daysLeft} días</span>
                    ) : (
                      <span>{item.daysLeft} días</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right" style={{ color: 'var(--color-obsidian)' }}>
                    S/ {item.inventoryValue.toLocaleString()}
                  </td>
                  {filterState === 'quiebre' && (
                    <td className="px-6 py-4 text-sm font-black text-right" style={{ color: 'var(--color-alarm-red)' }}>
                      - S/ {item.lostSalesRisk.toLocaleString()}
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    {filterState === 'quiebre' ? (
                      <button 
                        onClick={() => toggleCart(item.id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 justify-center w-full ${inCart ? 'bg-[var(--color-obsidian)] text-white' : 'wise-btn-outline'}`}
                      >
                        <ShoppingCart size={16} /> {inCart ? 'En carrito' : 'Añadir a OC'}
                      </button>
                    ) : (
                      <button className="wise-btn-outline w-full !text-amber-700 !border-amber-200">
                        Liquidar (Remate)
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                  Excelente, no tienes alertas de {filterState === 'quiebre' ? 'quiebre de stock' : 'sobre stock'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
