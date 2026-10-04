'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Send, Search, CheckCircle2, Building2, Package, MapPin, Truck, ExternalLink } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useSearchParams } from 'next/navigation';

export default function ComprasPage() {
  const searchParams = useSearchParams();
  const preSelectedProviderId = searchParams.get('provider');

  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(preSelectedProviderId || '');
  const [cart, setCart] = useState<{ name: string, qty: number, unitPrice: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch Mis Proveedores
    fetch('/api/suppliers?myProviders=true')
      .then(res => res.json())
      .then(data => {
        if (data.items) setProviders(data.items);
        setIsLoading(false);
      });
  }, []);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  const handleAddProduct = (name: string) => {
    // Si ya existe, aumentar cantidad
    const existingIndex = cart.findIndex(c => c.name === name);
    if (existingIndex >= 0) {
      handleQtyChange(existingIndex, cart[existingIndex].qty + 1);
    } else {
      setCart([...cart, { name, qty: 1, unitPrice: 0 }]); // Precio referencial es 0 hasta que pongan un precio negociado
    }
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const newCart = [...cart];
    newCart[index].qty = Math.max(1, newQty);
    setCart(newCart);
  };

  const handlePriceChange = (index: number, newPrice: number) => {
    const newCart = [...cart];
    newCart[index].unitPrice = Math.max(0, newPrice);
    setCart(newCart);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

  const handleSendOrder = () => {
    if (!selectedProvider) return;
    
    // Asumiendo que el contacto viene en phone o email
    const contactInfo = selectedProvider.contact_info || {};
    const phone = contactInfo.phone || '999999999'; // Fallback
    
    // Parsear el carrito para el link de WP
    const link = generateWhatsAppLink(phone, selectedProvider.name, cart.map(c => ({
      productId: c.name,
      name: c.name,
      qty: c.qty,
      unitPrice: c.unitPrice
    })), totalAmount);
    
    window.open(link, '_blank');
  };

  const filteredProducts = selectedProvider?.products_offered?.filter((p: string) => 
    p.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)", letterSpacing: '-0.03em' }}>
          Nueva Orden de Compra
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--color-pebble)" }}>
          Gestiona pedidos de reposición y envíalos directamente a tus proveedores vía WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Izquierdo: Selección y Catálogo */}
        <div className="lg:col-span-8 space-y-6">
          <div className="wise-card">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-obsidian)" }}>
              <Building2 size={20} style={{ color: 'var(--color-forest-ink)' }} /> 
              Selecciona tu Proveedor
            </h2>
            
            {isLoading ? (
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
            ) : (
              <select 
                className="wise-input cursor-pointer font-medium text-[var(--color-charcoal)]"
                value={selectedProviderId}
                onChange={(e) => { 
                  setSelectedProviderId(e.target.value); 
                  setCart([]); 
                  setSearchQuery('');
                }}
              >
                <option value="">-- Elige de tu red de proveedores --</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.payment_terms})</option>
                ))}
              </select>
            )}
            
            {!isLoading && providers.length === 0 && (
              <p className="text-sm mt-3 text-red-500 font-medium">
                No tienes proveedores en tu red. Ve al <a href="/proveedores" className="underline">Marketplace</a> para añadir uno.
              </p>
            )}
          </div>

          {selectedProvider && (
            <div className="wise-card !p-0 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-[var(--color-fog)] bg-[var(--color-fog)] bg-opacity-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-lg text-[var(--color-obsidian)] flex items-center gap-2">
                    Catálogo Disponible
                    {selectedProvider.verified && <CheckCircle2 size={16} className="text-green-600" />}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-[var(--color-charcoal)] font-medium">
                    <span className="flex items-center gap-1.5"><Truck size={14} style={{ color: 'var(--color-pebble)' }}/> Mínimo: ${selectedProvider.min_order_amount}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} style={{ color: 'var(--color-pebble)' }}/> {selectedProvider.location}</span>
                  </div>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--color-pebble)" }} />
                  <input 
                    type="text"
                    placeholder="Buscar SKU o nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="wise-input pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prodName: string, i: number) => (
                    <div key={i} className="p-4 border border-[var(--color-fog)] rounded-xl hover:border-[var(--color-forest-ink)] transition-colors flex items-center justify-between bg-white group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--color-fog)]">
                          <Package size={18} style={{ color: 'var(--color-charcoal)' }} />
                        </div>
                        <span className="font-bold text-sm text-[var(--color-obsidian)] group-hover:text-[var(--color-forest-ink)] transition-colors">
                          {prodName}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleAddProduct(prodName)}
                        className="p-2 rounded-lg hover:bg-[var(--color-forest-ink)] hover:text-white text-[var(--color-forest-ink)] transition-colors bg-[var(--color-fog)]"
                        title="Añadir a OC"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-sm font-medium text-[var(--color-pebble)]">
                    No se encontraron productos en el catálogo que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Resumen del Pedido (Sticky) */}
        <div className="lg:col-span-4">
          <div className="wise-card sticky top-6 !p-0 overflow-hidden shadow-xl shadow-[var(--color-fog)]">
            <div className="p-6 border-b border-[var(--color-fog)] bg-[var(--color-forest-ink)]">
              <h2 className="font-bold flex items-center gap-2 text-white text-lg">
                <ShoppingCart size={20} />
                Orden de Compra
              </h2>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-sm" style={{ color: "var(--color-pebble)" }}>
                  <ShoppingCart size={40} className="mx-auto mb-4 opacity-20" />
                  No has añadido ningún producto. <br/>Selecciona artículos del catálogo para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b border-[var(--color-fog)]">
                      <div className="flex-1 pr-4">
                        <div className="font-bold text-sm" style={{ color: "var(--color-obsidian)" }}>{item.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-[var(--color-pebble)]">Unit. $</span>
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            placeholder="0.00"
                            onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                            className="wise-input !py-1 !px-2 text-sm w-20"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-24">
                        <div className="flex items-center border border-[var(--color-fog)] rounded-lg overflow-hidden">
                          <button onClick={() => handleQtyChange(index, item.qty - 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 font-medium">-</button>
                          <div className="px-2 py-1 text-sm font-bold w-8 text-center">{item.qty}</div>
                          <button onClick={() => handleQtyChange(index, item.qty + 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 font-medium">+</button>
                        </div>
                        <div className="font-black text-sm" style={{ color: "var(--color-obsidian)" }}>
                          ${(item.qty * item.unitPrice).toFixed(2)}
                        </div>
                        <button onClick={() => handleRemoveItem(index)} className="text-[10px] uppercase font-bold text-red-500 hover:underline">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm font-medium text-[var(--color-charcoal)]">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black pt-4 border-t border-[var(--color-fog)]" style={{ color: "var(--color-obsidian)" }}>
                      <span>TOTAL</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {selectedProvider && totalAmount > 0 && totalAmount < (selectedProvider.min_order_amount || 0) && (
                    <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg flex gap-2">
                      <span className="text-amber-500">⚠</span>
                      El total no alcanza el pedido mínimo exigido por este proveedor (${selectedProvider.min_order_amount}).
                    </div>
                  )}

                  <button 
                    onClick={handleSendOrder}
                    className="wise-btn-primary w-full mt-6 flex items-center justify-center gap-2 h-12 text-base"
                  >
                    <Send size={18} />
                    Generar Vía WhatsApp
                  </button>
                  
                  <p className="text-center text-xs mt-3 text-[var(--color-pebble)] font-medium flex items-center justify-center gap-1">
                    Serás redirigido a WhatsApp Web <ExternalLink size={12}/>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
