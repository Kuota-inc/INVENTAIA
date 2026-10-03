'use client';

import React, { useState } from 'react';
import { Search, Plus, Settings, ChevronDown, ChevronUp, AlertCircle, ArrowDownToLine, SlidersHorizontal } from 'lucide-react';

// Mock Data para la vista unificada de Producto + Inventario
const mockProducts = [
  {
    id: 'p1',
    sku: 'SKU-001',
    name: 'Teclado Mecánico RGB',
    category: 'Periféricos',
    price: 120.0,
    totalStock: 45,
    inventory: [
      { branch: 'Sede Principal', stock: 30, minStock: 10 },
      { branch: 'Almacén Norte', stock: 15, minStock: 20 } // Alerta: Incompleto
    ]
  },
  {
    id: 'p2',
    sku: 'SKU-002',
    name: 'Monitor UltraWide 34"',
    category: 'Monitores',
    price: 450.0,
    totalStock: 8,
    inventory: [
      { branch: 'Sede Principal', stock: 8, minStock: 5 },
      { branch: 'Almacén Norte', stock: 0, minStock: 2 } // Alerta: Incompleto
    ]
  }
];

export default function InventarioUnificadoPage() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos e Inventario</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu catálogo de productos y el stock por sedes desde un solo lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Requisito: Importaciones es un botón de inventario */}
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <ArrowDownToLine size={20} />
            Importar
          </button>
          
          {/* Requisito: Ajustes es un botón dentro de inventario */}
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <SlidersHorizontal size={20} />
            Ajustes
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por SKU o Nombre..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Tabla Unificada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium w-10"></th>
                <th className="px-6 py-4 font-medium">SKU / Producto</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium text-right">Precio Unitario</th>
                <th className="px-6 py-4 font-medium text-right">Stock Total</th>
                <th className="px-6 py-4 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockProducts.map((product) => {
                const isExpanded = expandedRows[product.id];
                const hasAlert = product.inventory.some(inv => inv.stock < inv.minStock);

                return (
                  <React.Fragment key={product.id}>
                    <tr 
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`}
                      onClick={() => toggleRow(product.id)}
                    >
                      <td className="px-6 py-4 text-gray-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-gray-500">{product.sku}</div>
                        <div className="font-medium text-gray-900 mt-0.5">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {product.totalStock} unds
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasAlert ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                            <AlertCircle size={14} />
                            Alerta Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Óptimo
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Requisito: Inventario como desplegable de producto */}
                    {isExpanded && (
                      <tr className="bg-gray-50/50 border-t border-gray-50">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="pl-10">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Desglose de Inventario por Sede</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {product.inventory.map((inv, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${inv.stock < inv.minStock ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white'}`}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm text-gray-900">{inv.branch}</span>
                                    {inv.stock < inv.minStock && (
                                      <AlertCircle size={16} className="text-red-500" />
                                    )}
                                  </div>
                                  <div className="flex justify-between text-sm mt-3">
                                    <span className="text-gray-500">Stock Físico:</span>
                                    <span className={`font-medium ${inv.stock < inv.minStock ? 'text-red-700' : 'text-gray-900'}`}>
                                      {inv.stock} unds
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-400">Min. Requerido:</span>
                                    <span className="text-gray-500">{inv.minStock} unds</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                + Transferir Stock
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
