'use client';

import { 
  TrendingUp, 
  AlertCircle, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  Clock,
  Landmark,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// Mock de datos para la gráfica evolutiva
const salesData = [
  { month: 'Ene', sales: 12000, alert: false },
  { month: 'Feb', sales: 15000, alert: false },
  { month: 'Mar', sales: 18000, alert: true, alertType: 'quiebre', item: 'Teclado Mecánico' },
  { month: 'Abr', sales: 14000, alert: false },
  { month: 'May', sales: 22000, alert: false },
  { month: 'Jun', sales: 28000, alert: true, alertType: 'quiebre', item: 'Monitor 34"' },
  { month: 'Jul', sales: 25000, alert: false },
];

export default function DashboardPage() {
  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Panel Principal
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-pebble)' }}>
            Métricas clave, evolución de ventas y detecciones de inventario.
          </p>
        </div>
      </div>

      {/* Tarjetas de Indicadores Clave (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Valor Total del Inventario */}
        <div className="wise-card !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Valor Inventario</p>
            <Package size={16} style={{ color: 'var(--color-forest-ink)' }} />
          </div>
          <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>$45,200</h3>
          <div className="mt-2 text-xs font-medium" style={{ color: 'var(--color-pebble)' }}>
            A Precio de Venta (PV)
          </div>
        </div>

        {/* Días de Inventario Disponible */}
        <div className="wise-card !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Días Inventario</p>
            <Clock size={16} style={{ color: 'var(--color-forest-ink)' }} />
          </div>
          <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>42 Días</h3>
          <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-spruce)' }}>
            <ArrowUpRight size={14} /> Óptimo (Meta: 45)
          </div>
        </div>

        {/* Rotación de Inventario */}
        <div className="wise-card !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>Rotación</p>
            <RefreshCw size={16} style={{ color: 'var(--color-forest-ink)' }} />
          </div>
          <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>8.5x</h3>
          <div className="mt-2 text-xs font-medium" style={{ color: 'var(--color-pebble)' }}>
            Veces por año
          </div>
        </div>

        {/* CCC (Ciclo de Conversión) */}
        <div className="wise-card !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-slate)' }}>CCC</p>
            <TrendingUp size={16} style={{ color: 'var(--color-forest-ink)' }} />
          </div>
          <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>12 Días</h3>
          <div className="mt-2 text-xs font-medium text-amber-600">
            Ciclo Efectivo
          </div>
        </div>

        {/* Indicador de Financiamiento */}
        <div className="wise-card-dark !p-5 !rounded-[10px]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-linen-mist)' }}>Línea Crédito</p>
            <Landmark size={16} style={{ color: 'var(--color-lime-voltage)' }} />
          </div>
          <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-lime-voltage)' }}>$32,000</h3>
          <div className="mt-2 text-xs font-medium text-white opacity-80">
            Disponible para compras
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Gráfica de Ventas y Detección de Alertas */}
        <div className="lg:col-span-2 wise-card">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
            <TrendingUp size={20} style={{ color: 'var(--color-forest-ink)' }} />
            Evolución de Ventas y Alertas
          </h2>
          
          <div className="relative h-64 w-full flex items-end justify-between pt-10 pb-6 px-4 border-b border-[var(--color-fog)]">
            {salesData.map((data, idx) => {
              const height = (data.sales / maxSales) * 100;
              return (
                <div key={idx} className="relative flex flex-col items-center group w-1/12">
                  
                  {/* Tooltip de Alerta */}
                  {data.alert && (
                    <div className="absolute -top-12 z-20 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <div className="bg-[var(--color-obsidian)] text-white text-xs px-3 py-1.5 rounded-md font-medium shadow-xl">
                        Quiebre: {data.item}
                      </div>
                      <div className="w-2 h-2 bg-[var(--color-obsidian)] transform rotate-45 -mt-1"></div>
                    </div>
                  )}

                  {/* Marcador Visual de Alerta (Punto temporal) */}
                  {data.alert && (
                    <div className="absolute -top-4 z-10 animate-pulse">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                        <AlertCircle size={14} className="text-red-600" />
                      </div>
                    </div>
                  )}

                  {/* Barra de la gráfica */}
                  <div 
                    className="w-full rounded-t-sm transition-all duration-500 ease-in-out hover:opacity-80"
                    style={{ 
                      height: `${height}%`, 
                      background: data.alert ? 'var(--color-alarm-red)' : 'var(--color-forest-ink)'
                    }}
                  ></div>

                  {/* Etiqueta del mes */}
                  <div className="absolute -bottom-6 text-xs font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center gap-6 text-xs font-medium" style={{ color: 'var(--color-pebble)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-forest-ink)' }}></div>
              Ventas Regulares
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-alarm-red)' }}></div>
              Punto de Quiebre Detectado
            </div>
          </div>
        </div>

        {/* Panel de Accesos Directos PRD */}
        <div className="wise-card" style={{ background: 'var(--color-fog)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-obsidian)' }}>Módulos del Sistema</h2>
          <div className="space-y-3">
            <Link href="/inventario" className="flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--color-fog)] hover:border-[var(--color-forest-ink)] hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)' }}><Package size={18}/></div>
                <span className="font-bold text-sm" style={{ color: 'var(--color-charcoal)' }}>Mi Almacén</span>
              </div>
              <ArrowUpRight size={18} style={{ color: 'var(--color-pebble)' }} className="group-hover:text-[var(--color-forest-ink)]" />
            </Link>

            <Link href="/compras" className="flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--color-fog)] hover:border-[var(--color-forest-ink)] hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)' }}><ShoppingCart size={18}/></div>
                <span className="font-bold text-sm" style={{ color: 'var(--color-charcoal)' }}>Órdenes de Compra</span>
              </div>
              <ArrowUpRight size={18} style={{ color: 'var(--color-pebble)' }} className="group-hover:text-[var(--color-forest-ink)]" />
            </Link>

            <Link href="/financiamiento" className="flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--color-fog)] hover:border-[var(--color-forest-ink)] hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)' }}><Landmark size={18}/></div>
                <span className="font-bold text-sm" style={{ color: 'var(--color-charcoal)' }}>Financiamiento</span>
              </div>
              <ArrowUpRight size={18} style={{ color: 'var(--color-pebble)' }} className="group-hover:text-[var(--color-forest-ink)]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
