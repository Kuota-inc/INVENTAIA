'use client';

import { useState } from 'react';
import { Landmark, ArrowUpRight, CheckCircle2, Clock, AlertCircle, ShoppingCart, ChevronRight, FileText, X } from 'lucide-react';

const mockCreditLine = {
  total_amount: 50000,
  available_amount: 32000,
  monthly_interest_rate: 0.0145, // 1.45%
  status: 'active'
};

const mockPurchaseOrders = [
  { id: 'OC-2026-091', supplier: 'Alicorp S.A.A.', amount: 15400, status: 'aprobada', date: '2026-10-01', items: 24, paymentTerms: '30 días' },
  { id: 'OC-2026-094', supplier: 'Procter & Gamble', amount: 8250, status: 'aprobada', date: '2026-10-02', items: 12, paymentTerms: 'Contado' },
  { id: 'OC-2026-097', supplier: 'Nestlé Perú', amount: 45000, status: 'aprobada', date: '2026-10-03', items: 45, paymentTerms: '60 días' },
];

const mockDisbursements = [
  { id: '1', amount: 15000, term_days: 30, status: 'approved', date: '2026-09-28', description: 'Desembolso para Capital de Trabajo' },
  { id: '2', amount: 3000, term_days: 15, status: 'pending', date: '2026-10-02', description: 'Pago a Proveedor (OC-2026-088)' }
];

export default function FinanciamientoPage() {
  const [activeTab, setActiveTab] = useState<'capital' | 'ocs'>('ocs');
  const [requestAmount, setRequestAmount] = useState<number>(0);
  const [termDays, setTermDays] = useState<number>(30);
  const [selectedOC, setSelectedOC] = useState<any>(null);

  const formatCurrency = (val: number) => `S/ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const financialCost = requestAmount * mockCreditLine.monthly_interest_rate * (termDays / 30);

  const handleRequest = () => {
    if (requestAmount <= 0 || requestAmount > mockCreditLine.available_amount) {
      alert('Monto inválido');
      return;
    }
    alert(`Se ha enviado la solicitud de desembolso por ${formatCurrency(requestAmount)} a ${termDays} días.`);
    setSelectedOC(null);
  };

  const handleFinanceOC = (oc: any) => {
    setSelectedOC(oc);
    setRequestAmount(oc.amount);
    setTermDays(30); // Default
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-obsidian)]" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em' }}>Financiamiento B2B</h1>
          <p className="mt-1 text-[var(--color-pebble)]">
            Gestiona tu línea de crédito para inyectar liquidez o pagar órdenes de compra a proveedores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Línea de Crédito & Contenido */}
        <div className="lg:col-span-2 space-y-6">
          <div className="wise-card-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Landmark size={140} />
            </div>
            
            <div className="relative z-10">
              <p className="font-medium mb-1 opacity-80" style={{ color: 'var(--color-paper)' }}>Línea de Crédito Disponible</p>
              <h2 className="text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-wise-sans)', letterSpacing: '-0.03em', color: 'var(--color-lime-voltage)' }}>
                {formatCurrency(mockCreditLine.available_amount)}
              </h2>
              
              <div className="mt-8 flex items-center gap-8">
                <div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--color-paper)' }}>Línea Total Aprobada</p>
                  <p className="font-bold text-lg" style={{ color: 'var(--color-paper)' }}>{formatCurrency(mockCreditLine.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80" style={{ color: 'var(--color-paper)' }}>Tasa Mensual (TEA)</p>
                  <p className="font-bold text-lg" style={{ color: 'var(--color-paper)' }}>{(mockCreditLine.monthly_interest_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="wise-segmented">
            <button 
              className={activeTab === 'ocs' ? 'active' : ''} 
              onClick={() => setActiveTab('ocs')}
            >
              Órdenes de Compra Elegibles
            </button>
            <button 
              className={activeTab === 'capital' ? 'active' : ''} 
              onClick={() => setActiveTab('capital')}
            >
              Historial de Desembolsos
            </button>
          </div>

          {activeTab === 'ocs' && (
            <div className="wise-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-obsidian)' }}>Órdenes de Compra por Financiar</h3>
                <span className="wise-badge" style={{ background: 'var(--color-fog)' }}>{mockPurchaseOrders.length} OCs Activas</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="text-sm border-b border-[var(--color-fog)]" style={{ background: 'var(--color-fog)', color: 'var(--color-charcoal)' }}>
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">ID Órden</th>
                      <th className="px-4 py-3 font-semibold">Proveedor</th>
                      <th className="px-4 py-3 font-semibold">Condición</th>
                      <th className="px-4 py-3 font-semibold text-right">Monto</th>
                      <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-fog)]">
                    {mockPurchaseOrders.map(oc => (
                      <tr key={oc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-bold" style={{ color: 'var(--color-obsidian)' }}>{oc.id}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-pebble)' }}>{oc.date} • {oc.items} SKUs</div>
                        </td>
                        <td className="px-4 py-4 font-medium" style={{ color: 'var(--color-charcoal)' }}>
                          {oc.supplier}
                        </td>
                        <td className="px-4 py-4 text-sm" style={{ color: 'var(--color-pebble)' }}>
                          {oc.paymentTerms}
                        </td>
                        <td className="px-4 py-4 text-right font-black" style={{ color: 'var(--color-obsidian)' }}>
                          {formatCurrency(oc.amount)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {oc.amount <= mockCreditLine.available_amount ? (
                            <button 
                              onClick={() => handleFinanceOC(oc)}
                              className="wise-btn-primary !px-4 !py-2 !text-sm"
                            >
                              Financiar
                            </button>
                          ) : (
                            <span className="wise-badge gap-1" style={{ background: '#fecaca', color: 'var(--color-alarm-red)' }}>
                              <AlertCircle size={12}/> Línea Insuficiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'capital' && (
            <div className="wise-card">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-obsidian)' }}>Historial de Desembolsos</h3>
              
              <div className="space-y-4">
                {mockDisbursements.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-[10px] border border-[var(--color-fog)] hover:bg-[var(--color-fog)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full" style={{ background: 'var(--color-linen-mist)', color: 'var(--color-forest-ink)' }}>
                        {req.status === 'approved' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: 'var(--color-charcoal)' }}>{req.description}</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-pebble)' }}>{req.date} • Plazo: {req.term_days} días</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg" style={{ color: 'var(--color-obsidian)' }}>{formatCurrency(req.amount)}</p>
                      <div className="mt-1">
                        <span className={req.status === 'approved' ? 'wise-badge-dark' : 'wise-badge'}>
                          {req.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Solicitar Capital de Trabajo Independiente */}
        <div className="wise-card h-fit sticky top-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-obsidian)' }}>
            <Landmark size={20} style={{ color: 'var(--color-forest-ink)' }} />
            Capital de Trabajo
          </h3>

          <div className="space-y-6">
            <p className="text-sm" style={{ color: 'var(--color-pebble)' }}>
              Solicita liquidez directa a tu cuenta bancaria para otros gastos operativos.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>Monto a solicitar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--color-forest-ink)' }}>S/</span>
                <input 
                  type="number" 
                  value={requestAmount}
                  onChange={(e) => {
                    setRequestAmount(parseFloat(e.target.value) || 0);
                    setSelectedOC(null);
                  }}
                  className="wise-input pl-10 text-lg font-bold"
                />
              </div>
              {requestAmount > mockCreditLine.available_amount && (
                <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--color-alarm-red)' }}>
                  <AlertCircle size={12}/> Supera el límite disponible
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-charcoal)' }}>Plazo (Días)</label>
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
                <span style={{ color: 'var(--color-pebble)' }}>Costo Financiero Estimado</span>
                <span className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{formatCurrency(financialCost)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span style={{ color: 'var(--color-pebble)' }}>Total a devolver</span>
                <span className="font-bold" style={{ color: 'var(--color-obsidian)' }}>{formatCurrency(requestAmount + financialCost)}</span>
              </div>
            </div>

            <button 
              onClick={handleRequest}
              disabled={requestAmount <= 0 || requestAmount > mockCreditLine.available_amount}
              className="wise-btn-primary w-full mt-4 justify-center"
              style={{ opacity: (requestAmount <= 0 || requestAmount > mockCreditLine.available_amount) ? 0.5 : 1 }}
            >
              Confirmar Desembolso
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Financiamiento de Orden de Compra */}
      {selectedOC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-[var(--color-fog)]">
            <div className="p-8 pb-6 border-b border-[var(--color-fog)] flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-linen-mist)' }}>
                  <FileText size={32} style={{ color: 'var(--color-forest-ink)' }} />
                </div>
                <div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-wise-sans)', color: 'var(--color-obsidian)' }}>
                    Financiar {selectedOC.id}
                  </h2>
                  <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-pebble)' }}>Proveedor: {selectedOC.supplier}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOC(null)}
                className="p-2 rounded-full hover:bg-[var(--color-fog)] transition-colors text-[var(--color-pebble)]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 bg-[var(--color-paper)]">
              
              <div className="p-4 rounded-xl border border-[var(--color-fog)] bg-[var(--color-fog)] bg-opacity-30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--color-charcoal)' }}>Monto de la OC</span>
                  <span className="text-xl font-black" style={{ color: 'var(--color-obsidian)' }}>{formatCurrency(selectedOC.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-pebble)' }}>Línea Disponible Restante</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-forest-ink)' }}>
                    {formatCurrency(mockCreditLine.available_amount - selectedOC.amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold" style={{ color: 'var(--color-charcoal)' }}>¿En cuántos días planeas pagar?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[15, 30, 45, 60].map(days => (
                    <button
                      key={days}
                      onClick={() => setTermDays(days)}
                      className={`py-3 px-4 rounded-xl border text-center font-bold transition-all ${termDays === days ? 'border-[var(--color-forest-ink)] bg-[var(--color-forest-ink)] text-[var(--color-paper)] shadow-md' : 'border-[var(--color-fog)] text-[var(--color-charcoal)] hover:bg-[var(--color-fog)]'}`}
                    >
                      {days} Días
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-fog)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: 'var(--color-pebble)' }}>Interés generado ({termDays} días)</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-alarm-red)' }}>+ {formatCurrency(selectedOC.amount * mockCreditLine.monthly_interest_rate * (termDays / 30))}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-base font-bold" style={{ color: 'var(--color-charcoal)' }}>Total a Pagar</span>
                  <span className="text-2xl font-black" style={{ color: 'var(--color-obsidian)', fontFamily: 'var(--font-wise-sans)' }}>
                    {formatCurrency(selectedOC.amount + (selectedOC.amount * mockCreditLine.monthly_interest_rate * (termDays / 30)))}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-[var(--color-fog)] bg-gray-50 flex gap-3 rounded-b-[28px]">
              <button 
                onClick={() => setSelectedOC(null)}
                className="wise-btn-outline flex-1 justify-center"
              >
                Cancelar
              </button>
              <button 
                onClick={handleRequest}
                className="wise-btn-primary flex-1 justify-center"
              >
                Confirmar Pago a Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
