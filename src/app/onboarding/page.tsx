'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, Briefcase, FileText, MapPin, Calendar, 
  ArrowRight, UploadCloud, Link as LinkIcon, Edit3, 
  CheckCircle2, Rocket, ArrowLeft, Loader2
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 1.1 Perfil de Empresa
  const [formData, setFormData] = useState({
    businessName: '',
    employees: '',
    sector: '',
    taxId: '',
    years: '',
    address: ''
  });

  // 1.2 Ingesta
  const [ingestMethod, setIngestMethod] = useState<'csv' | 'integracion' | 'cero' | null>(null);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-fog)]">
      <div className="max-w-2xl w-full wise-card !p-0 overflow-hidden shadow-2xl relative">
        
        {/* Header Visual */}
        <div className="p-8 pb-10 text-center relative overflow-hidden" style={{ background: "var(--color-forest-ink)" }}>
          <div className="absolute -right-4 -top-4 opacity-10">
            <Rocket size={120} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-wise-sans)", color: "var(--color-lime-voltage)" }}>
              Bienvenido a KUOTA
            </h1>
            <p className="text-[var(--color-paper)] opacity-80 text-sm max-w-md">
              Configura el ecosistema de tu negocio para activar las alertas predictivas de quiebre y el motor financiero.
            </p>

            <div className="flex justify-center items-center gap-3 mt-8">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`} />
                  {s < 4 && <div className={`h-0.5 w-8 rounded-full transition-colors ${step > s ? 'bg-[var(--color-lime-voltage)]' : 'bg-[var(--color-spruce)]'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 sm:p-10 bg-[var(--color-paper)] min-h-[400px] flex flex-col">
          
          {/* STEP 1: PERFIL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex-1">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: "var(--color-obsidian)" }}>
                <Building2 size={24} style={{ color: "var(--color-forest-ink)" }} />
                Perfil de Empresa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-slate)" }}>Nombre del Negocio</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} />
                    <input type="text" placeholder="Ej. Comercial Los Andes" className="wise-input pl-9"
                      value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-slate)" }}>RUC / DNI</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} />
                    <input type="text" placeholder="Ej. 20123456789" className="wise-input pl-9"
                      value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-slate)" }}>Rubro / Sector</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} />
                    <select className="wise-input pl-9 font-medium" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                      <option value="">Selecciona rubro...</option>
                      <option value="retail">Retail / Minimarket</option>
                      <option value="distribucion">Distribuidora Mayorista</option>
                      <option value="farmacia">Farmacia / Salud</option>
                      <option value="ferreteria">Ferretería</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-slate)" }}>Nº Empleados</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} />
                    <select className="wise-input pl-9 font-medium" value={formData.employees} onChange={e => setFormData({...formData, employees: e.target.value})}>
                      <option value="">Cantidad...</option>
                      <option value="1-5">1 a 5</option>
                      <option value="6-20">6 a 20</option>
                      <option value="21-50">21 a 50</option>
                      <option value="50+">Más de 50</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-slate)" }}>Dirección Fiscal</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-pebble)" }} />
                    <input type="text" placeholder="Ej. Av. Javier Prado Este 123, Lima" className="wise-input pl-9"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: METODO INGESTA */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 flex-1">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: "var(--color-obsidian)" }}>
                <FileText size={24} style={{ color: "var(--color-forest-ink)" }} />
                ¿Cómo subirás tu inventario?
              </h2>
              <div className="space-y-4">
                <div 
                  onClick={() => setIngestMethod('csv')}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${ingestMethod === 'csv' ? 'border-[var(--color-forest-ink)] bg-[var(--color-linen-mist)]' : 'border-[var(--color-fog)] hover:border-[var(--color-pebble)]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white"><UploadCloud size={24} style={{ color: "var(--color-forest-ink)" }}/></div>
                    <div>
                      <h3 className="font-bold text-[var(--color-obsidian)]">Subida por Archivo CSV / Excel</h3>
                      <p className="text-sm text-[var(--color-charcoal)] mt-0.5">Sube tu plantilla de productos, stock y costos de forma masiva.</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setIngestMethod('integracion')}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${ingestMethod === 'integracion' ? 'border-[var(--color-forest-ink)] bg-[var(--color-linen-mist)]' : 'border-[var(--color-fog)] hover:border-[var(--color-pebble)]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white"><LinkIcon size={24} style={{ color: "var(--color-signal-blue)" }}/></div>
                    <div>
                      <h3 className="font-bold text-[var(--color-obsidian)]">Integración de Sistemas (ERP)</h3>
                      <p className="text-sm text-[var(--color-charcoal)] mt-0.5">Conecta Bsale, SAP, o tu facturador electrónico automáticamente.</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setIngestMethod('cero')}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${ingestMethod === 'cero' ? 'border-[var(--color-forest-ink)] bg-[var(--color-linen-mist)]' : 'border-[var(--color-fog)] hover:border-[var(--color-pebble)]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-white"><Edit3 size={24} style={{ color: "var(--color-charcoal)" }}/></div>
                    <div>
                      <h3 className="font-bold text-[var(--color-obsidian)]">Crear desde cero (Metodología ABC)</h3>
                      <p className="text-sm text-[var(--color-charcoal)] mt-0.5">Ingresa manualmente tus productos top ventas paso a paso.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: METODOLOGIA ABC (SIMULACION) */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 flex-1">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2" style={{ color: "var(--color-obsidian)" }}>
                <Edit3 size={24} style={{ color: "var(--color-forest-ink)" }} />
                Ingesta Inicial (Metodología ABC)
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-pebble)" }}>
                No necesitas subir todo tu catálogo hoy. Identifiquemos tus 3 productos de rotación "A" (los que más vendes) para monitorearlos primero.
              </p>
              
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="p-4 rounded-xl border border-[var(--color-fog)] flex gap-4">
                    <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--color-fog)", color: "var(--color-charcoal)" }}>
                      #{num}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <div className="sm:col-span-3">
                         <input type="text" placeholder="Nombre del producto top ventas..." className="wise-input w-full !py-1.5 !text-sm" />
                      </div>
                      <div>
                        <input type="number" placeholder="Precio (PV)" className="wise-input w-full !py-1.5 !text-sm" />
                      </div>
                      <div>
                        <input type="number" placeholder="Costo (CVU)" className="wise-input w-full !py-1.5 !text-sm" />
                      </div>
                      <div>
                        <input type="number" placeholder="Stock actual" className="wise-input w-full !py-1.5 !text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="animate-in fade-in zoom-in-95 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-linen-mist)", color: "var(--color-forest-ink)" }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "var(--font-wise-sans)", color: "var(--color-obsidian)" }}>
                A más inventario, mejores resultados.
              </h2>
              <p className="text-base max-w-sm mx-auto" style={{ color: "var(--color-charcoal)" }}>
                Tu perfil comercial está listo. El motor de KUOTA está analizando tus datos para proyectar tu primera recomendación de compra.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--color-fog)] flex items-center justify-between">
            {step > 1 && step < 4 ? (
              <button onClick={handlePrev} className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: "var(--color-slate)" }}>
                <ArrowLeft size={16} /> Atrás
              </button>
            ) : <div />}

            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={step === 1 && !formData.businessName || step === 2 && !ingestMethod}
                className="wise-btn-primary flex items-center gap-2 ml-auto"
              >
                Continuar <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={finishOnboarding}
                disabled={loading}
                className="wise-btn-primary flex items-center gap-2 mx-auto w-full sm:w-auto justify-center"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Ir a mi Panel de Control'}
                {!loading && <ArrowRight size={18} />}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
