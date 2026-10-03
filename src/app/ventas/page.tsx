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
          <h1 className="text-2xl font-bold text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)" }}>Punto de Venta (POS)</h1>
          <p className="mt-1" style={{ color: "var(--color-pebble)" }}>
            Procesa tus ventas rápidas e intégralas con la pasarela de pagos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Simulación del carrito/venta */}
        <div className="wise-card space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--color-fog)] pb-3" style={{ color: "var(--color-obsidian)" }}>
            <ShoppingBag size={20} style={{ color: "var(--color-forest-ink)" }} />
            Detalle de Venta
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--color-charcoal)" }}>
                <User size={16} style={{ color: "var(--color-pebble)" }} />
                Cliente (Opcional)
              </label>
              <input 
                type="text" 
                placeholder="Nombre o empresa..." 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="wise-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>Monto Total a Cobrar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: "var(--color-forest-ink)" }}>$</span>
                <input 
                  type="number" 
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="wise-input pl-8 text-lg font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pagos / Culqi */}
        <div className="wise-card space-y-6" style={{ background: "var(--color-fog)" }}>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-[var(--color-pebble)] pb-3" style={{ color: "var(--color-obsidian)" }}>
            <CreditCard size={20} style={{ color: "var(--color-forest-ink)" }} />
            Métodos de Pago
          </h2>

          <div className="space-y-4">
            <button 
              onClick={handleCheckoutCulqi}
              disabled={amount <= 0}
              className="wise-btn-primary w-full py-4 flex items-center justify-center gap-2"
              style={{ opacity: amount > 0 ? 1 : 0.5 }}
            >
              <CreditCard size={20} />
              Cobrar con Tarjeta (Culqi)
            </button>
            <p className="text-xs text-center" style={{ color: "var(--color-pebble)" }}>
              Esta acción abrirá el modal seguro de Culqi para procesar el pago con tarjeta de crédito/débito.
            </p>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[var(--color-pebble)] opacity-30"></div>
              <span className="flex-shrink-0 mx-4 text-sm" style={{ color: "var(--color-pebble)" }}>O</span>
              <div className="flex-grow border-t border-[var(--color-pebble)] opacity-30"></div>
            </div>

            <button 
              disabled={amount <= 0}
              className="wise-btn-outline w-full py-3"
              style={{ opacity: amount > 0 ? 1 : 0.5 }}
            >
              Registrar Pago en Efectivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
