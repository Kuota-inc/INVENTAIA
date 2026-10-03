'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

// Mock Data inicial
const initialProvider = {
  id: '1',
  name: 'TechSolutions Inc.',
  description: 'Mayorista de componentes electrónicos',
  terms: 'Crédito a 30 días, envío gratis a partir de $500',
  contact: '+1 234 567 8900',
  products: [
    {
      id: 'prod_1',
      name: 'Monitor UltraWide 34"',
      scalePrices: [
        { qty: 1, price: 500 },
        { qty: 10, price: 450 },
        { qty: 50, price: 400 }
      ]
    }
  ]
};

export default function ProveedorDetailPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState(initialProvider);

  // Funciones mock para modificar el catálogo (en un entorno real llamarían a la API)
  const addProduct = () => {
    setProvider(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { id: `new_${Date.now()}`, name: '', scalePrices: [{ qty: 1, price: 0 }] }
      ]
    }));
  };

  const addScalePrice = (productId: string) => {
    setProvider(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId 
          ? { ...p, scalePrices: [...p.scalePrices, { qty: 0, price: 0 }] } 
          : p
      )
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proveedores" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
            <p className="text-gray-500 text-sm">Gestiona la información y catálogo de este proveedor</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm">
          <Save size={18} />
          Guardar Cambios
        </button>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Información General</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre del Proveedor</label>
            <input 
              type="text" 
              value={provider.name}
              onChange={(e) => setProvider({...provider, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone size={16} className="text-gray-400"/> WhatsApp / Contacto
            </label>
            <input 
              type="text" 
              value={provider.contact}
              onChange={(e) => setProvider({...provider, contact: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-gray-400"/> Términos Comerciales
            </label>
            <textarea 
              value={provider.terms}
              onChange={(e) => setProvider({...provider, terms: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Catálogo de Productos y Precios por Escala */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Catálogo y Precios por Escala</h2>
          <button onClick={addProduct} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
            <Plus size={16} /> Añadir Producto
          </button>
        </div>

        <div className="space-y-6">
          {provider.products.map((product, pIndex) => (
            <div key={product.id} className="p-5 rounded-lg border border-gray-100 bg-gray-50/30">
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Producto a comprar</label>
                    <input 
                      type="text" 
                      value={product.name}
                      placeholder="Ej. Monitor Samsung 24..."
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium"
                      readOnly // En una app real esto tendría un onChange
                    />
                  </div>
                  
                  {/* Escalas de Precios */}
                  <div className="space-y-2">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Reglas de Precios (Por Volumen)</label>
                     <div className="space-y-2">
                       {product.scalePrices.map((scale, sIndex) => (
                         <div key={sIndex} className="flex items-center gap-3">
                           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 w-1/3">
                             <span className="text-sm text-gray-500">A partir de</span>
                             <input type="number" value={scale.qty} className="w-full text-sm outline-none font-medium" readOnly />
                             <span className="text-sm text-gray-500">unds</span>
                           </div>
                           <span className="text-gray-400">&rarr;</span>
                           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 w-1/3">
                             <span className="text-sm text-gray-500">$</span>
                             <input type="number" value={scale.price} className="w-full text-sm outline-none font-medium text-green-700" readOnly />
                             <span className="text-sm text-gray-500">c/u</span>
                           </div>
                           <button className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors">
                             <Trash2 size={16} />
                           </button>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => addScalePrice(product.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2">
                        <Plus size={14} /> Añadir regla de escala
                     </button>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-red-500 p-2 bg-white border border-gray-100 rounded-lg hover:border-red-100 shadow-sm transition-colors mt-6">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {provider.products.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              Este proveedor aún no tiene productos en su catálogo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
