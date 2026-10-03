'use client';

import { useState } from 'react';
import { Landmark, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// Mocks simulando los datos de Prisma (CreditLine y DisbursementRequest)
const mockCreditLine = {
  total_amount: 50000,
  available_amount: 32000,
  monthly_interest_rate: 0.0145, // 1.45%
  status: 'active'
};

const mockDisbursements = [
  { id: '1', amount: 15000, term_days: 30, status: 'approved', date: '2026-09-28' },
  { id: '2', amount: 3000, term_days: 15, status: 'pending', date: '2026-10-02' }
];

export default function FinanciamientoPage() {
  const [requestAmount, setRequestAmount] = useState<number>(0);
  const [termDays, setTermDays] = useState<number>(30);

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const financialCost = requestAmount * mockCreditLine.monthly_interest_rate * (termDays / 30);

  const handleRequest = () => {
    if (requestAmount <= 0 || requestAmount > mockCreditLine.available_amount) {
      alert('Monto inválido');
      return;
    }
    alert(`Se ha enviado la solicitud de desembolso por ${formatCurrency(requestAmount)} a ${termDays} días.`);
    // Aquí se conectaría con la creación en base de datos de DisbursementRequest
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-obsidian)]" style={{ fontFamily: "var(--font-wise-sans)" }}>Financiamiento</h1>
          <p className="mt-1" style={{ color: "var(--color-pebble)" }}>
            Gestiona tu línea de crédito B2B para pagar órdenes de compra a proveedores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Línea de Crédito */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wise-card-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Landmark size={120} />
            </div>
            
            <div className="relative z-10">
              <p className="font-medium mb-1 opacity-80">Línea de Crédito Disponible</p>
              <h2 className="text-5xl font-black tracking-tight" style={{ fontFamily: "var(--font-wise-sans)", letterSpacing: "-0.03em" }}>{formatCurrency(mockCreditLine.available_amount)}</h2>
              
              <div className="mt-8 flex items-center gap-8">
                <div>
                  <p className="text-sm opacity-80">Línea Total Aprobada</p>
                  <p className="font-medium text-lg">{formatCurrency(mockCreditLine.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Tasa Mensual</p>
                  <p className="font-medium text-lg">{(mockCreditLine.monthly_interest_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Desembolsos */}
          <div className="wise-card">
            <h3 className="text-xl font-bold mb-6" style={{ color: "var(--color-obsidian)" }}>Historial de Desembolsos</h3>
            
            <div className="space-y-4">
              {mockDisbursements.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-fog)] hover:bg-[var(--color-fog)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full" style={{ background: "var(--color-linen-mist)", color: "var(--color-forest-ink)" }}>
                      {req.status === 'approved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "var(--color-charcoal)" }}>Desembolso para Capital de Trabajo</p>
                      <p className="text-sm" style={{ color: "var(--color-pebble)" }}>{req.date} • Plazo: {req.term_days} días</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: "var(--color-obsidian)" }}>{formatCurrency(req.amount)}</p>
                    <div className="mt-2">
                      <span className={req.status === 'approved' ? 'wise-badge-dark' : 'wise-badge'}>
                        {req.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Solicitar Desembolso */}
        <div className="wise-card h-fit sticky top-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-obsidian)" }}>
            <ArrowUpRight size={20} style={{ color: "var(--color-forest-ink)" }} />
            Solicitar Desembolso
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>Monto a solicitar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: "var(--color-forest-ink)" }}>$</span>
                <input 
                  type="number" 
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(parseFloat(e.target.value) || 0)}
                  className="wise-input pl-8 text-lg font-bold"
                />
              </div>
              {requestAmount > mockCreditLine.available_amount && (
                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--color-alarm-red)" }}>
                  <AlertCircle size={12}/> Supera el límite disponible
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>Plazo (Días)</label>
              <select 
                value={termDays}
                onChange={(e) => setTermDays(parseInt(e.target.value))}
                className="wise-input bg-white cursor-pointer"
              >
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
              </select>
            </div>

            <div className="pt-6 border-t border-[var(--color-fog)] space-y-4">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-pebble)" }}>Costo Financiero Estimado</span>
                <span className="font-semibold" style={{ color: "var(--color-charcoal)" }}>{formatCurrency(financialCost)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span style={{ color: "var(--color-pebble)" }}>Total a devolver</span>
                <span className="font-bold" style={{ color: "var(--color-obsidian)" }}>{formatCurrency(requestAmount + financialCost)}</span>
              </div>
            </div>

            <button 
              onClick={handleRequest}
              disabled={requestAmount <= 0 || requestAmount > mockCreditLine.available_amount}
              className="wise-btn-primary w-full mt-4"
              style={{ opacity: (requestAmount <= 0 || requestAmount > mockCreditLine.available_amount) ? 0.5 : 1 }}
            >
              Confirmar Solicitud
            </button>
            <p className="text-xs text-center mt-4" style={{ color: "var(--color-pebble)" }}>
              Sujeto a evaluación y aprobación crediticia en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
