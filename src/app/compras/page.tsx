'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Send, Search, CheckCircle2 } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

// Mocks
const mockProviders = [
  {
    id: '1', name: 'TechSolutions Inc.', contact: '+12345678900',
    products: [
      { id: 'p1', name: 'Monitor UltraWide 34"', scalePrices: [{ qty: 1, price: 500 }, { qty: 10, price: 450 }] },
      { id: 'p2', name: 'Teclado Mecánico', scalePrices: [{ qty: 1, price: 100 }, { qty: 50, price: 80 }] }
    ]
  }
];

export default function ComprasPage() {
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [cart, setCart] = useState<{ productId: string, name: string, qty: number, unitPrice: number }[]>([]);

  const selectedProvider = mockProviders.find(p => p.id === selectedProviderId);

  // Calcula el precio dinámicamente según la cantidad y la escala
  const getCalculatedPrice = (productId: string, qty: number) => {
    if (!selectedProvider) return 0;
    const product = selectedProvider.products.find(p => p.id === productId);
    if (!product) return 0;

    // Buscar el precio aplicable (el que tenga la cantidad mayor o igual a qty)
    const applicableScale = [...product.scalePrices]
      .sort((a, b) => b.qty - a.qty) // Ordenamos de mayor a menor cantidad requerida
      .find(scale => qty >= scale.qty);

    return applicableScale ? applicableScale.price : product.scalePrices[0]?.price || 0;
  };

  const handleAddProduct = (productId: string, name: string) => {
    const qty = 1;
    const price = getCalculatedPrice(productId, qty);
    setCart([...cart, { productId, name, qty, unitPrice: price }]);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const newCart = [...cart];
    newCart[index].qty = newQty;
    newCart[index].unitPrice = getCalculatedPrice(newCart[index].productId, newQty);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);

  const handleSendOrder = () => {
    if (!selectedProvider) return;
    const link = generateWhatsAppLink(selectedProvider.contact, selectedProvider.name, cart, totalAmount);
    window.open(link, '_blank'); // Redirige a wa.me para enviar el mensaje
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)" }}>Nueva Orden de Compra</h1>
          <p className="mt-1" style={{ color: "var(--color-pebble)" }}>Crea pedidos y envíalos directamente a tus proveedores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selección y Catálogo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wise-card">
            <h2 className="font-bold mb-4" style={{ color: "var(--color-obsidian)" }}>1. Selecciona un Proveedor</h2>
            <select 
              className="wise-input cursor-pointer"
              value={selectedProviderId}
              onChange={(e) => { setSelectedProviderId(e.target.value); setCart([]); }}
            >
              <option value="">-- Elige un proveedor --</option>
              {mockProviders.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProvider && (
            <div className="wise-card">
              <h2 className="font-bold mb-4" style={{ color: "var(--color-obsidian)" }}>2. Catálogo del Proveedor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProvider.products.map(product => (
                  <div key={product.id} className="p-4 border border-[var(--color-fog)] rounded-xl hover:shadow-sm transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="font-bold" style={{ color: "var(--color-charcoal)" }}>{product.name}</div>
                      <div className="text-sm mt-2 mb-4" style={{ color: "var(--color-pebble)" }}>
                        {product.scalePrices.map((s, i) => (
                          <div key={i} className="flex justify-between border-b border-[var(--color-fog)] pb-1 mb-1 last:border-0">
                            <span>A partir de {s.qty} unds</span>
                            <span className="font-semibold" style={{ color: "var(--color-obsidian)" }}>${s.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddProduct(product.id, product.name)}
                      className="wise-btn-outline w-full"
                    >
                      <Plus size={16} /> Añadir al pedido
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumen del Pedido */}
        <div className="wise-card h-fit sticky top-6">
          <h2 className="font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-obsidian)" }}>
            <ShoppingCart size={20} style={{ color: "var(--color-forest-ink)" }}/>
            Resumen del Pedido
          </h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: "var(--color-pebble)" }}>
              Tu pedido está vacío.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-4 border-b border-[var(--color-fog)]">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-sm" style={{ color: "var(--color-charcoal)" }}>{item.name}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--color-pebble)" }}>
                      Precio Unitario: ${item.unitPrice}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-24">
                    <input 
                      type="number" 
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                      className="wise-input px-2 py-1 text-center font-semibold"
                    />
                    <div className="font-bold text-sm" style={{ color: "var(--color-obsidian)" }}>
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[var(--color-fog)] flex justify-between items-center text-lg font-bold" style={{ color: "var(--color-obsidian)" }}>
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleSendOrder}
                className="wise-btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Enviar Orden por WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
