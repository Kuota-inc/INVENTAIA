'use client';

import { 
  TrendingUp, 
  AlertCircle, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500 mt-1">
            Resumen de tu negocio, alertas de inventario y estado financiero.
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Hoy</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">$1,240.50</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-green-600 font-medium">
              <ArrowUpRight size={16} className="mr-1" /> +12.5%
            </span>
            <span className="text-gray-400 ml-2">vs. ayer</span>
          </div>
        </div>

        {/* Órdenes Pendientes */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Compras Pendientes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">4</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Link href="/compras" className="text-blue-600 hover:underline font-medium">
              Ver seguimiento &rarr;
            </Link>
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Alertas de Stock</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">2 Items</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Link href="/inventario" className="text-red-600 hover:underline font-medium">
              Reabastecer ahora &rarr;
            </Link>
          </div>
        </div>

        {/* Valor de Inventario */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Valor de Inventario</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">$45k</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-gray-500 font-medium">
              Repartido en 2 sedes
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Gráfico / Tendencia (Mock) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-400" />
            Rendimiento de Ventas
          </h2>
          {/* Espacio simulado para gráfico de líneas */}
          <div className="h-64 w-full bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
            [Gráfico de Ventas Mensual - Recharts/Chart.js]
          </div>
        </div>

        {/* Panel de Acciones Rápidas */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link href="/ventas" className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md"><DollarSign size={18}/></div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">Nueva Venta POS</span>
              </div>
              <ArrowUpRight size={18} className="text-gray-300 group-hover:text-blue-600" />
            </Link>

            <Link href="/compras" className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-md"><ShoppingCart size={18}/></div>
                <span className="font-medium text-gray-700 group-hover:text-green-600">Comprar a Proveedor</span>
              </div>
              <ArrowUpRight size={18} className="text-gray-300 group-hover:text-green-600" />
            </Link>

            <Link href="/proveedores" className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-md"><Package size={18}/></div>
                <span className="font-medium text-gray-700 group-hover:text-purple-600">Ver Catálogos</span>
              </div>
              <ArrowUpRight size={18} className="text-gray-300 group-hover:text-purple-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
