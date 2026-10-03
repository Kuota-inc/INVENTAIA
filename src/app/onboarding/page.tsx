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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Progress Header */}
        <div className="bg-gray-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Rocket size={100} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Bienvenido a Inventa.ai</h1>
          <p className="text-gray-400">Configuremos tu negocio en 3 sencillos pasos.</p>
          
          <div className="flex justify-center items-center gap-4 mt-8 relative z-10">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 text-blue-600 mb-6">
                <Store size={24} />
                <h2 className="text-xl font-bold text-gray-900">Tu Empresa</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Negocio</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Mi Tienda SAC"
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Sede Principal</label>
                  <input 
                    type="text" 
                    value={formData.branchName}
                    onChange={e => setFormData({...formData, branchName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Podrás añadir más sedes luego.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 text-blue-600 mb-6">
                <Truck size={24} />
                <h2 className="text-xl font-bold text-gray-900">Tu Primer Proveedor</h2>
              </div>
              <p className="text-sm text-gray-600">
                Añade a tu proveedor de mayor confianza para empezar a gestionar compras de forma inteligente.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Distribuidora del Norte"
                    value={formData.providerName}
                    onChange={e => setFormData({...formData, providerName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Todo Listo!</h2>
              <p className="text-gray-600">
                Tu cuenta ha sido configurada correctamente. Estás a punto de acceder al nuevo Panel de Control.
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-10 flex justify-end">
            <button 
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
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
