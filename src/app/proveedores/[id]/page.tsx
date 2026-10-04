'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

const initialProvider = {
  id: '1',
  name: 'TechSolutions Inc.',
  description: 'Mayorista de componentes electrónicos',
  terms: 'Crédito a 30 días, envío gratis a partir de S/ 500',
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

  const addProduct = () => {
    setProvider(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { id: `new_${Date.now()}`, name: '', scalePrices: [{ qty: 1, price: 0 }] }
      ]
    }));
  };

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proveedores" className="p-2 hover:bg-[var(--color-fog)] rounded-full transition-colors text-[var(--color-slate)]">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.02em' }}>
              {provider.name}
            </h1>
            <p className="text-[var(--color-charcoal)] mt-1">Gestiona la información y catálogo de este proveedor</p>
          </div>
        </div>
        <button className="wise-btn-primary flex items-center gap-2">
          <Save size={18} /> Guardar Cambios
        </button>
      </div>

      {/* Información General */}
      <div className="wise-card">
        <h2 className="text-xl font-bold text-[var(--color-obsidian)] mb-6">Información General</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-charcoal)]">Nombre del Proveedor</label>
            <input 
              type="text" 
              value={provider.name}
              onChange={(e) => setProvider({...provider, name: e.target.value})}
              className="wise-input w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-2">
              <Phone size={16} className="text-[var(--color-forest-ink)]" /> WhatsApp / Contacto
            </label>
            <input 
              type="text" 
              value={provider.contact}
              onChange={(e) => setProvider({...provider, contact: e.target.value})}
              className="wise-input w-full"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-[var(--color-charcoal)] flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-forest-ink)]" /> Términos Comerciales
            </label>
            <textarea 
              value={provider.terms}
              onChange={(e) => setProvider({...provider, terms: e.target.value})}
              rows={2}
              className="wise-input w-full resize-none"
            />
          </div>
        </div>
      </div>

      {/* Catálogo de Productos */}
      <div className="wise-card">
        <div className="flex items-center justify-between border-b border-[var(--color-fog)] pb-4 mb-6">
          <h2 className="text-xl font-bold text-[var(--color-obsidian)]">Catálogo y Precios por Escala</h2>
          <button onClick={addProduct} className="text-sm text-[var(--color-forest-ink)] font-bold flex items-center gap-1.5 hover:underline">
            <Plus size={16} /> Añadir Producto
          </button>
        </div>

        <div className="space-y-6">
          {provider.products.map((product) => (
            <div key={product.id} className="p-6 rounded-[10px] bg-[var(--color-fog)] border border-[var(--color-pebble)]/20">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-slate)] uppercase tracking-wider block mb-2">Producto a comprar</label>
                  <input 
                    type="text" 
                    value={product.name}
                    placeholder="Ej. Monitor Samsung 24..."
                    className="wise-input w-full bg-white"
                    readOnly
                  />
                </div>
                
                <div className="space-y-3">
                   <label className="text-xs font-bold text-[var(--color-slate)] uppercase tracking-wider block">Reglas de Precios (Por Volumen)</label>
                   <div className="space-y-3">
                     {product.scalePrices.map((scale, sIndex) => (
                       <div key={sIndex} className="flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-white border border-[var(--color-pebble)] rounded-[10px] px-4 py-2 w-1/3">
                           <span className="text-sm font-medium text-[var(--color-slate)]">A partir de</span>
                           <input type="number" value={scale.qty} className="w-full text-sm outline-none font-bold text-[var(--color-obsidian)] bg-transparent" readOnly />
                           <span className="text-sm font-medium text-[var(--color-slate)]">unds</span>
                         </div>
                         <span className="text-[var(--color-pebble)]">&rarr;</span>
                         <div className="flex items-center gap-2 bg-[var(--color-linen-mist)] border border-[var(--color-forest-ink)]/20 rounded-[10px] px-4 py-2 w-1/3">
                           <span className="text-sm font-medium text-[var(--color-forest-ink)]">S/</span>
                           <input type="number" value={scale.price} className="w-full text-sm outline-none font-bold text-[var(--color-forest-ink)] bg-transparent" readOnly />
                           <span className="text-sm font-medium text-[var(--color-forest-ink)]">c/u</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
