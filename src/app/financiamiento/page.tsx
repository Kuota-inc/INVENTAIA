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
          <h1 className="text-2xl font-bold text-gray-900">Financiamiento</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu línea de crédito B2B para pagar órdenes de compra a proveedores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Línea de Crédito */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Landmark size={120} />
            </div>
            
            <div className="relative z-10">
              <p className="text-gray-300 font-medium mb-1">Línea de Crédito Disponible</p>
              <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(mockCreditLine.available_amount)}</h2>
              
              <div className="mt-8 flex items-center gap-8">
                <div>
                  <p className="text-gray-400 text-sm">Línea Total Aprobada</p>
                  <p className="font-medium text-lg">{formatCurrency(mockCreditLine.total_amount)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tasa Mensual</p>
                  <p className="font-medium text-lg">{(mockCreditLine.monthly_interest_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Desembolsos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Desembolsos</h3>
            
            <div className="space-y-4">
              {mockDisbursements.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {req.status === 'approved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Desembolso para Capital de Trabajo</p>
                      <p className="text-sm text-gray-500">{req.date} • Plazo: {req.term_days} días</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(req.amount)}</p>
                    <p className={`text-xs font-medium uppercase tracking-wider mt-1 ${req.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>
                      {req.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Solicitar Desembolso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ArrowUpRight size={20} className="text-blue-600" />
            Solicitar Desembolso
          </h3>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Monto a solicitar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input 
                  type="number" 
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-200 text-lg font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              {requestAmount > mockCreditLine.available_amount && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12}/> Supera el límite disponible
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Plazo (Días)</label>
              <select 
                value={termDays}
                onChange={(e) => setTermDays(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
              >
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
                <option value={60}>60 días</option>
                <option value={90}>90 días</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Costo Financiero Estimado</span>
                <span className="font-medium text-gray-900">{formatCurrency(financialCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total a devolver</span>
                <span className="font-bold text-gray-900">{formatCurrency(requestAmount + financialCost)}</span>
              </div>
            </div>

            <button 
              onClick={handleRequest}
              disabled={requestAmount <= 0 || requestAmount > mockCreditLine.available_amount}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-white shadow-sm transition-all
                ${(requestAmount > 0 && requestAmount <= mockCreditLine.available_amount) 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Confirmar Solicitud
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Sujeto a evaluación y aprobación crediticia en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
