'use client';

import { useState } from 'react';
import { CheckCircle2, ArrowRight, Store, Truck, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    branchName: 'Sede Principal',
    providerName: '',
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Finalizar onboarding y redirigir al dashboard
      router.push('/panel');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--color-fog)" }}>
      <div className="max-w-xl w-full wise-card !p-0 overflow-hidden shadow-xl">
        
        {/* Progress Header */}
        <div className="p-10 text-center relative overflow-hidden" style={{ background: "var(--color-forest-ink)", color: "var(--color-paper)" }}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Rocket size={100} />
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-wise-sans)", color: "var(--color-lime-voltage)" }}>Bienvenido a Inventa.ai</h1>
          <p className="opacity-80">Configuremos tu negocio en 3 sencillos pasos.</p>
          
          <div className="flex justify-center items-center gap-4 mt-8 relative z-10">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`}></div>
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`}></div>
            <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`}></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6" style={{ color: "var(--color-forest-ink)" }}>
                <Store size={24} />
                <h2 className="text-xl font-bold" style={{ color: "var(--color-obsidian)" }}>Tu Empresa</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-charcoal)" }}>Nombre de tu Negocio</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Mi Tienda SAC"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                    className="wise-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-charcoal)" }}>Nombre de tu Sede Principal</label>
                  <input 
                    type="text" 
                    value={formData.branchName}
                    onChange={e => setFormData({...formData, branchName: e.target.value})}
                    className="wise-input"
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--color-pebble)" }}>Podrás añadir más sedes luego.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-6" style={{ color: "var(--color-forest-ink)" }}>
                <Truck size={24} />
                <h2 className="text-xl font-bold" style={{ color: "var(--color-obsidian)" }}>Tu Primer Proveedor</h2>
              </div>
              <p className="text-sm" style={{ color: "var(--color-charcoal)" }}>
                Añade a tu proveedor de mayor confianza para empezar a gestionar compras de forma inteligente.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-charcoal)" }}>Nombre del Proveedor</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Distribuidora del Norte"
                    value={formData.providerName}
                    onChange={e => setFormData({...formData, providerName: e.target.value})}
                    className="wise-input"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-linen-mist)", color: "var(--color-forest-ink)" }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-obsidian)" }}>¡Todo Listo!</h2>
              <p style={{ color: "var(--color-charcoal)" }}>
                Tu cuenta ha sido configurada correctamente. Estás a punto de acceder al nuevo Panel de Control.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-10 flex justify-end">
            <button 
              onClick={nextStep}
              className="wise-btn-primary px-8"
            >
              {step === 3 ? 'Ir al Dashboard' : 'Continuar'}
              {step < 3 && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
