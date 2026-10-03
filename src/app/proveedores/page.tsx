'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, Trash2, Building2, ExternalLink, ShieldCheck, MapPin, Package, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Tipado y Mock Data
type Provider = {
  id: string;
  name: string;
  description: string;
  category: string;
  minOrder: number;
  paymentTerms: string;
  logistics: string;
  fiscalId: string;
  verified: boolean;
  location: string;
  products: string[];
};

const MARKETPLACE_PROVIDERS: Provider[] = [
  {
    id: '1',
    name: 'TechSolutions Mayorista',
    description: 'Distribuidor oficial de componentes electrónicos y periféricos.',
    category: 'Electrónica',
    minOrder: 500,
    paymentTerms: 'Crédito a 30 días',
    logistics: 'Envío gratis nacional en 48h',
    fiscalId: 'RUC 20543123456',
    verified: true,
    location: 'Lima, Perú',
    products: ['Teclados Mecánicos', 'Monitores', 'Mouse Gamer']
  },
  {
    id: '2',
    name: 'Importaciones Globales',
    description: 'Productos de oficina y suministros generales corporativos.',
    category: 'Suministros',
    minOrder: 150,
    paymentTerms: 'Pago contra entrega',
    logistics: 'Retiro en almacén',
    fiscalId: 'RUC 10452345678',
    verified: false,
    location: 'Arequipa, Perú',
    products: ['Sillas de Oficina', 'Papelería', 'Escritorios']
  },
  {
    id: '3',
    name: 'ElectroTech B2B',
    description: 'Especialistas en hardware para servidores y redes.',
    category: 'Infraestructura',
    minOrder: 1500,
    paymentTerms: '50% adelanto, 50% a 15 días',
    logistics: 'Envío asegurado vía courier',
    fiscalId: 'RUC 20987654321',
    verified: true,
    location: 'Bogotá, Colombia',
    products: ['Servidores', 'Switches', 'Cables de Red']
  }
];

export default function ProveedoresPage() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'mis_providers'>('marketplace');
  const [myProviders, setMyProviders] = useState<string[]>(['1']); // IDs de los proveedores guardados
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para la Vista Detalle (Modal)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Filtrado
  const filteredMarketplace = MARKETPLACE_PROVIDERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.products.some(prod => prod.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMyProviders = MARKETPLACE_PROVIDERS.filter(p => myProviders.includes(p.id));

  const handleAdd = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!myProviders.includes(id)) {
      setMyProviders([...myProviders, id]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMyProviders(myProviders.filter(pid => pid !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>
            Proveedores
          </h1>
          <p className="mt-1" style={{ color: 'var(--color-pebble)' }}>
            Explora el marketplace B2B o administra tu red de contactos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-fog)]">
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'marketplace' ? 'border-[var(--color-forest-ink)] text-[var(--color-obsidian)]' : 'border-transparent text-[var(--color-pebble)] hover:text-[var(--color-charcoal)]'}`}
        >
          Marketplace (Descubrir)
        </button>
        <button 
          onClick={() => setActiveTab('mis_providers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'mis_providers' ? 'border-[var(--color-forest-ink)] text-[var(--color-obsidian)]' : 'border-transparent text-[var(--color-pebble)] hover:text-[var(--color-charcoal)]'}`}
        >
          Mis Providers ({myProviders.length})
        </button>
      </div>

      {/* Contenido del Tab Activo */}
      {activeTab === 'marketplace' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* Herramientas del Marketplace */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-pebble)' }} size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o producto (ej. 'Monitores')..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wise-input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button className="wise-btn-outline !py-2 !px-3">
                <SlidersHorizontal size={18} /> Filtros (Pago / Mínimos)
              </button>
            </div>
          </div>

          {/* Grid de Marketplace */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketplace.map(provider => (
              <div 
                key={provider.id} 
                onClick={() => setSelectedProvider(provider)}
                className="wise-card flex flex-col justify-between cursor-pointer hover:border-[var(--color-forest-ink)] hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--color-fog)' }}>
                      <Building2 size={24} style={{ color: 'var(--color-forest-ink)' }} />
                    </div>
                    {provider.verified && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        <ShieldCheck size={12} /> Verificado
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--color-forest-ink)] transition-colors" style={{ color: 'var(--color-obsidian)' }}>
                    {provider.name}
                  </h3>
                  <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-pebble)' }}>
                    {provider.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-xs font-medium gap-2" style={{ color: 'var(--color-charcoal)' }}>
                      <CreditCard size={14} style={{ color: 'var(--color-pebble)' }}/> {provider.paymentTerms}
                    </div>
                    <div className="flex items-center text-xs font-medium gap-2" style={{ color: 'var(--color-charcoal)' }}>
                      <Package size={14} style={{ color: 'var(--color-pebble)' }}/> Pedido Mín: ${provider.minOrder}
                    </div>
                  </div>
                </div>

                {myProviders.includes(provider.id) ? (
                  <button disabled className="w-full py-2.5 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200 flex items-center justify-center gap-2">
                    <ShieldCheck size={16} /> Ya en Mis Providers
                  </button>
                ) : (
                  <button 
                    onClick={(e) => handleAdd(e, provider.id)}
                    className="wise-btn-primary w-full py-2.5 text-sm"
                  >
                    + Añadir a Mis Providers
                  </button>
                )}
              </div>
            ))}
            
            {filteredMarketplace.length === 0 && (
              <div className="col-span-full py-12 text-center" style={{ color: 'var(--color-pebble)' }}>
                No se encontraron proveedores en el marketplace.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="wise-card !p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-sm border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Proveedor</th>
                  <th className="px-6 py-4 font-semibold">Ubicación / Datos</th>
                  <th className="px-6 py-4 font-semibold">Condiciones</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-fog)]">
                {filteredMyProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-[var(--color-fog)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--color-fog)' }}>
                          <Building2 size={20} style={{ color: 'var(--color-forest-ink)' }} />
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1" style={{ color: 'var(--color-obsidian)' }}>
                            {provider.name} 
                            {provider.verified && <ShieldCheck size={14} className="text-green-600" />}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{provider.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>{provider.location}</div>
                      <div className="text-xs font-mono mt-1" style={{ color: 'var(--color-pebble)' }}>{provider.fiscalId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
                      {provider.paymentTerms}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        href={`/compras?provider=${provider.id}`}
                        className="inline-flex px-3 py-1.5 rounded-lg text-sm font-bold bg-[var(--color-fog)] text-[var(--color-obsidian)] hover:bg-[var(--color-forest-ink)] hover:text-white transition-colors"
                      >
                        Comprar
                      </Link>
                      <button 
                        onClick={(e) => handleRemove(e, provider.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar de Mis Providers"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredMyProviders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>
                      Aún no has agregado proveedores a tu red. Explora el Marketplace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle del Proveedor */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[var(--color-fog)] flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-fog)' }}>
                  <Building2 size={32} style={{ color: 'var(--color-forest-ink)' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>
                    {selectedProvider.name}
                    {selectedProvider.verified && <ShieldCheck size={20} className="text-green-600" title="Verificado" />}
                  </h2>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-pebble)' }}>{selectedProvider.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="p-2 rounded-full hover:bg-[var(--color-fog)] transition-colors text-[var(--color-pebble)]"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-charcoal)' }}>
                {selectedProvider.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-[var(--color-fog)] bg-opacity-30">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>Datos Fiscales</div>
                  <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
                    <ShieldCheck size={16} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.fiscalId}
                  </div>
                  <div className="text-sm font-medium flex items-center gap-2 mt-2" style={{ color: 'var(--color-obsidian)' }}>
                    <MapPin size={16} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.location}
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-[var(--color-fog)] bg-opacity-30">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-slate)' }}>Condiciones</div>
                  <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
                    <CreditCard size={16} style={{ color: 'var(--color-pebble)' }} /> {selectedProvider.paymentTerms}
                  </div>
                  <div className="text-sm font-medium flex items-center gap-2 mt-2" style={{ color: 'var(--color-obsidian)' }}>
                    <Package size={16} style={{ color: 'var(--color-pebble)' }} /> Pedido Mínimo: ${selectedProvider.minOrder}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-slate)' }}>Logística</div>
                <div className="text-sm font-medium px-4 py-3 rounded-xl border border-[var(--color-fog)]" style={{ color: 'var(--color-charcoal)' }}>
                  {selectedProvider.logistics}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-slate)' }}>Catálogo Ofrecido</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.products.map(prod => (
                    <span key={prod} className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-fog)] text-[var(--color-obsidian)] border border-gray-200">
                      {prod}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--color-fog)] bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="wise-btn-outline px-6"
              >
                Cerrar
              </button>
              {myProviders.includes(selectedProvider.id) ? (
                <Link href={`/compras?provider=${selectedProvider.id}`} className="wise-btn-primary px-6 flex items-center gap-2">
                  Ir a Comprar <ChevronRight size={16} />
                </Link>
              ) : (
                <button 
                  onClick={(e) => {
                    handleAdd(e, selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                  className="wise-btn-primary px-6"
                >
                  Añadir a Mis Providers
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
