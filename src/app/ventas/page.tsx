'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, Search, User, Plus, Trash2, Banknote } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function VentasPage() {
  const [customerName, setCustomerName] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/products?pageSize=100')
      .then(res => res.json())
      .then(data => {
        if (data.items) setProducts(data.items);
      });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setSearchQuery('');
  };

  const handleQtyChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckoutCulqi = () => {
    alert(`💳 Procesando pago con Culqi...\nMonto: $${totalAmount.toFixed(2)}\nCliente: ${customerName || 'Consumidor Final'}`);
    setCart([]);
    setCustomerName('');
  };

  const handleCashCheckout = () => {
    alert(`💵 Pago en efectivo registrado.\nMonto: $${totalAmount.toFixed(2)}\nCliente: ${customerName || 'Consumidor Final'}`);
    setCart([]);
    setCustomerName('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)", letterSpacing: '-0.03em' }}>Punto de Venta (POS)</h1>
          <p className="mt-1" style={{ color: "var(--color-pebble)" }}>
            Añade productos al carrito y procesa tus ventas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Lado Izquierdo: Buscador y Carrito */}
        <div className="lg:col-span-8 space-y-6">
          <div className="wise-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-fog)] bg-[var(--color-fog)] bg-opacity-30 flex gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--color-pebble)" }} />
                <input 
                  type="text" 
                  placeholder="Buscar producto por nombre o SKU para añadir..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="wise-input pl-10 w-full"
                />
              </div>
            </div>

            {/* Resultados de búsqueda rápidos */}
            {searchQuery && (
              <div className="p-2 border-b border-[var(--color-fog)] bg-white max-h-64 overflow-y-auto">
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                  <div key={p.id} onClick={() => handleAddToCart(p)} className="p-3 hover:bg-[var(--color-fog)] cursor-pointer rounded-lg flex justify-between items-center group transition-colors">
                    <div>
                      <div className="font-bold text-sm text-[var(--color-obsidian)]">{p.name}</div>
                      <div className="text-xs text-[var(--color-pebble)]">{p.sku} • Stock: {p.stock}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[var(--color-forest-ink)]">${p.price.toFixed(2)}</span>
                      <button className="p-1.5 rounded bg-[var(--color-fog)] text-[var(--color-forest-ink)] group-hover:bg-[var(--color-forest-ink)] group-hover:text-white transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-sm text-[var(--color-pebble)]">No se encontraron productos.</div>
                )}
              </div>
            )}

            {/* Carrito de Compras */}
            <div className="p-6">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: "var(--color-obsidian)" }}>
                <ShoppingBag size={20} style={{ color: "var(--color-forest-ink)" }} />
                Detalle de Venta
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-fog)] rounded-xl">
                  <ShoppingBag size={48} className="mx-auto mb-3 opacity-20 text-[var(--color-pebble)]" />
                  <p className="text-[var(--color-pebble)] font-medium">El carrito está vacío.</p>
                  <p className="text-xs mt-1 text-[var(--color-pebble)] opacity-70">Busca productos arriba para añadirlos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-[var(--color-fog)] rounded-xl bg-gray-50/50">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[var(--color-obsidian)]">{item.name}</div>
                        <div className="text-xs text-[var(--color-pebble)] mt-0.5">Precio Unitario: ${item.price.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-white border border-[var(--color-fog)] rounded-lg overflow-hidden shadow-sm">
                          <button onClick={() => handleQtyChange(item.id, item.qty - 1)} className="px-3 py-1.5 hover:bg-gray-100 font-medium text-[var(--color-charcoal)]">-</button>
                          <div className="px-3 py-1.5 text-sm font-bold w-10 text-center border-x border-[var(--color-fog)]">{item.qty}</div>
                          <button onClick={() => handleQtyChange(item.id, item.qty + 1)} className="px-3 py-1.5 hover:bg-gray-100 font-medium text-[var(--color-charcoal)]">+</button>
                        </div>
                        <div className="font-black text-base w-20 text-right text-[var(--color-obsidian)]">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                        <button onClick={() => handleQtyChange(item.id, 0)} className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Pagos y Cliente */}
        <div className="lg:col-span-4 space-y-6">
          <div className="wise-card sticky top-6 !p-0 overflow-hidden shadow-lg shadow-[var(--color-fog)] border-2 border-[var(--color-forest-ink)]">
            <div className="p-6 bg-[var(--color-forest-ink)] text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CreditCard size={20} />
                Cobro y Cierre
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--color-slate)" }}>
                  <User size={14} /> Cliente (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Nombre o empresa..." 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="wise-input bg-gray-50 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-fog)]">
                <div className="flex justify-between items-center text-xs font-bold text-[var(--color-slate)] mb-1 uppercase tracking-wider">
                  Total a Cobrar
                </div>
                <div className="text-4xl font-black" style={{ color: "var(--color-obsidian)", fontFamily: "var(--font-wise-sans)" }}>
                  ${totalAmount.toFixed(2)}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleCheckoutCulqi}
                  disabled={totalAmount <= 0}
                  className="wise-btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
                  style={{ opacity: totalAmount > 0 ? 1 : 0.5 }}
                >
                  <CreditCard size={18} />
                  Cobrar con Tarjeta (Culqi)
                </button>
                <p className="text-[11px] text-center px-4 leading-tight" style={{ color: "var(--color-pebble)" }}>
                  Abre el modal seguro de Culqi para tarjetas de crédito/débito.
                </p>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[var(--color-fog)]"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-slate)" }}>O</span>
                  <div className="flex-grow border-t border-[var(--color-fog)]"></div>
                </div>

                <button 
                  onClick={handleCashCheckout}
                  disabled={totalAmount <= 0}
                  className="wise-btn-outline w-full py-3 flex items-center justify-center gap-2 font-bold text-sm"
                  style={{ opacity: totalAmount > 0 ? 1 : 0.5 }}
                >
                  <Banknote size={18} />
                  Pago en Efectivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
