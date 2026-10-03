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
          <h1 className="text-2xl font-bold text-gray-900">Nueva Orden de Compra</h1>
          <p className="text-gray-500 mt-1">Crea pedidos y envíalos directamente a tus proveedores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selección y Catálogo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">1. Selecciona un Proveedor</h2>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20"
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
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">2. Catálogo del Proveedor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedProvider.products.map(product => (
                  <div key={product.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 mt-1 mb-4">
                      {product.scalePrices.map((s, i) => (
                        <div key={i}>&gt; {s.qty} unds: ${s.price}</div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAddProduct(product.id, product.name)}
                      className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors"
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
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={20}/>
            Resumen del Pedido
          </h2>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Tu pedido está vacío.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-50">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Precio Unitario: ${item.unitPrice}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-20">
                    <input 
                      type="number" 
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                      className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded-md"
                    />
                    <div className="font-semibold text-sm text-gray-900">
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleSendOrder}
                className="w-full mt-6 py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
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
