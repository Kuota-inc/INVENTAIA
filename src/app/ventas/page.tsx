'use client';

import { useState } from 'react';
import { CreditCard, ShoppingBag, Search, User } from 'lucide-react';

export default function VentasPage() {
  const [amount, setAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');

  // Lógica MVP para integración con Culqi
  const handleCheckoutCulqi = () => {
    // Aquí inicializamos el SDK de Culqi
    // Esto asume que el script de Culqi está cargado en el layout o componente padre
    // window.Culqi.publicKey = 'TU_LLAVE_PUBLICA_AQUI';
    // window.Culqi.settings({
    //   title: 'Venta Inventa.ai',
    //   currency: 'PEN',
    //   description: `Venta a ${customerName || 'Cliente Básico'}`,
    //   amount: amount * 100 // Culqi procesa en céntimos
    // });
    // window.Culqi.open();
    
    alert(`Se abriría el modal de Culqi (Checkout) para cobrar $${amount} a ${customerName}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Punto de Venta (POS)</h1>
          <p className="text-gray-500 mt-1">
            Procesa tus ventas rápidas e intégralas con la pasarela de pagos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Simulación del carrito/venta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShoppingBag size={20} />
            Detalle de Venta
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                Cliente (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Nombre o empresa..." 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Monto Total a Cobrar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input 
                  type="number" 
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 text-lg font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pagos / Culqi */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
            <CreditCard size={20} />
            Métodos de Pago
          </h2>

          <div className="space-y-4">
            <button 
              onClick={handleCheckoutCulqi}
              disabled={amount <= 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all
                ${amount > 0 ? 'bg-[#ff5d5b] hover:bg-[#e04a48]' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <CreditCard size={20} />
              Cobrar con Tarjeta (Culqi)
            </button>
            <p className="text-xs text-center text-gray-500">
              Esta acción abrirá el modal seguro de Culqi para procesar el pago con tarjeta de crédito/débito.
            </p>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button 
              disabled={amount <= 0}
              className={`w-full py-3 rounded-xl font-semibold border-2 flex items-center justify-center gap-2 transition-all
                ${amount > 0 ? 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Registrar Pago en Efectivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
