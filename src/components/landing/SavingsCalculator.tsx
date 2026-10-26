'use client';

import React, { useState, useEffect } from 'react';
import { Percent, TrendingDown, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import styles from '@/app/page.module.css';

interface SavingsCalculatorProps {
  mode: 'comprar' | 'vender';
  onModeChange: (mode: 'comprar' | 'vender') => void;
  onNavigateToDownload: () => void;
}

interface TermOption {
  label: string;
  days: number;
  weeks: number;
}

const BUY_TERMS: TermOption[] = [
  { label: '15 días', days: 15, weeks: 2 },
  { label: '1 mes', days: 30, weeks: 4 },
  { label: '2 meses', days: 60, weeks: 8 },
  { label: '3 meses', days: 90, weeks: 12 },
  { label: '5 meses', days: 150, weeks: 20 },
  { label: '6 meses', days: 180, weeks: 24 },
  { label: '12 meses', days: 360, weeks: 48 },
];

export function SavingsCalculator({ mode, onModeChange, onNavigateToDownload }: SavingsCalculatorProps) {
  // Estado Modo Comprar
  const [buyAmount, setBuyAmount] = useState<number>(1000);
  const [selectedTerm, setSelectedTerm] = useState<TermOption>(BUY_TERMS[3]); // 3 meses default

  // Estado Modo Vender
  const [salesAmount, setSalesAmount] = useState<number>(10000);

  // Registro de primera interacción
  const [hasInteracted, setHasInteracted] = useState(false);

  const markInteracted = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      trackEvent({
        name: 'calculator_use',
        amount: mode === 'comprar' ? buyAmount : salesAmount,
        term: mode === 'comprar' ? selectedTerm.label : undefined,
      });
    }
  };

  // ----------------------------------------------------
  // Cálculos Comprar
  // Kuota: 5% fijo único
  const buyCostKuota = Math.round(buyAmount * 0.05);
  // Alternativa: TEA 100% compuesto: monto * ((1 + 1.00)^(dias / 360) - 1)
  const buyCostAlt = Math.round(buyAmount * (Math.pow(2, selectedTerm.days / 360) - 1));
  const buySavings = Math.max(0, buyCostAlt - buyCostKuota);

  const weeklyInstallmentKuota = Math.round((buyAmount + buyCostKuota) / selectedTerm.weeks);
  const weeklyInstallmentAlt = Math.round((buyAmount + buyCostAlt) / selectedTerm.weeks);

  // ----------------------------------------------------
  // Cálculos Vender
  // Kuota: 1%
  const sellCommissionMonthlyKuota = Math.round(salesAmount * 0.01);
  const sellCommissionAnnualKuota = sellCommissionMonthlyKuota * 12;

  // Alternativa: 3.5%
  const sellCommissionMonthlyAlt = Math.round(salesAmount * 0.035);
  const sellCommissionAnnualAlt = sellCommissionMonthlyAlt * 12;

  const sellSavingsMonthly = sellCommissionMonthlyAlt - sellCommissionMonthlyKuota;
  const sellSavingsAnnual = sellCommissionAnnualAlt - sellCommissionAnnualKuota;

  return (
    <section id="calculadora" className={styles.calculatorSection} aria-label="Calculadora de ahorro interactiva">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPretitle}>Simula y Compara</span>
          <h2 className={styles.sectionTitle}>
            Calcula tu <span style={{ color: 'var(--color-dodger-blue)', fontWeight: 400 }}>ahorro real</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Sin letras chicas ni tasas ocultas. Comprueba cuánto dinero mantienes en tu negocio usando Kuota.
          </p>
        </div>

        {/* Switch Comprar / Vender */}
        <div className={styles.switchContainer}>
          <div className={styles.segmentedControl} role="tablist" aria-label="Tipo de calculadora">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'comprar'}
              className={`${styles.segmentTab} ${mode === 'comprar' ? styles.segmentTabActive : ''}`}
              onClick={() => {
                onModeChange('comprar');
                trackEvent({ name: 'calculator_mode', mode: 'comprar' });
              }}
            >
              Calculadora Comprar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'vender'}
              className={`${styles.segmentTab} ${mode === 'vender' ? styles.segmentTabActive : ''}`}
              onClick={() => {
                onModeChange('vender');
                trackEvent({ name: 'calculator_mode', mode: 'vender' });
              }}
            >
              Calculadora Vender
            </button>
          </div>
        </div>

        {/* Card Contenedor */}
        <div className={styles.calcWrapperCard}>
          <div className={styles.calcInputsAndResults}>
            {/* Columna Izquierda: Entradas */}
            <div>
              {mode === 'comprar' ? (
                <>
                  <div className={styles.calcInputGroup}>
                    <div className={styles.calcLabelRow}>
                      <label htmlFor="buy-amount-input" className={styles.calcLabel}>
                        Monto a financiar con tu proveedor:
                      </label>
                      <div className={styles.calcAmountInputWrap}>
                        <span>S/</span>
                        <input
                          id="buy-amount-input"
                          type="number"
                          min={200}
                          max={10000}
                          step={50}
                          value={buyAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBuyAmount(isNaN(val) ? 0 : Math.min(10000, Math.max(0, val)));
                            markInteracted();
                          }}
                          className={styles.calcAmountInput}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={10000}
                      step={50}
                      value={buyAmount}
                      onChange={(e) => {
                        setBuyAmount(Number(e.target.value));
                        markInteracted();
                      }}
                      className={styles.calcSlider}
                      aria-label="Deslizador monto a financiar"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      <span>S/ 200</span>
                      <span>S/ 5,000</span>
                      <span>S/ 10,000</span>
                    </div>
                  </div>

                  <div className={styles.calcInputGroup}>
                    <div className={styles.calcLabelRow}>
                      <span className={styles.calcLabel}>Plazo en cuotas semanales:</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-dodger-blue)' }}>
                        {selectedTerm.weeks} semanas ({selectedTerm.label})
                      </span>
                    </div>

                    <div className={styles.termPillsGrid} role="radiogroup" aria-label="Plazo de pago">
                      {BUY_TERMS.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          role="radio"
                          aria-checked={selectedTerm.label === t.label}
                          className={`${styles.termPill} ${selectedTerm.label === t.label ? styles.termPillActive : ''}`}
                          onClick={() => {
                            setSelectedTerm(t);
                            markInteracted();
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fbfe', borderRadius: '10px', padding: '14px', border: '1px solid var(--color-hairline)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-deep-navy)', marginBottom: '4px' }}>
                      Plan Kuota Transparente:
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-crayola-blue)' }}>
                      Pagas únicamente <strong>5% de cobro único</strong> (S/ {buyCostKuota.toLocaleString()}). Sin comisiones ocultas, sin mora diaria y sin presiones.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.calcInputGroup}>
                    <div className={styles.calcLabelRow}>
                      <label htmlFor="sales-amount-input" className={styles.calcLabel}>
                        Ventas mensuales estimadas con tarjeta:
                      </label>
                      <div className={styles.calcAmountInputWrap}>
                        <span>S/</span>
                        <input
                          id="sales-amount-input"
                          type="number"
                          min={500}
                          max={50000}
                          step={500}
                          value={salesAmount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSalesAmount(isNaN(val) ? 0 : Math.min(50000, Math.max(0, val)));
                            markInteracted();
                          }}
                          className={styles.calcAmountInput}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={50000}
                      step={500}
                      value={salesAmount}
                      onChange={(e) => {
                        setSalesAmount(Number(e.target.value));
                        markInteracted();
                      }}
                      className={styles.calcSlider}
                      aria-label="Deslizador ventas mensuales con tarjeta"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      <span>S/ 1,000</span>
                      <span>S/ 25,000</span>
                      <span>S/ 50,000</span>
                    </div>
                  </div>

                  <div style={{ background: '#f8fbfe', borderRadius: '10px', padding: '16px', border: '1px solid var(--color-hairline)', marginTop: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-deep-navy)', marginBottom: '8px' }}>
                      ¿Por qué Kuota es 70% más económica?
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-crayola-blue)', margin: 0, lineHeight: 1.5 }}>
                      Los POS tradicionales y pasarelas bancarias cobran comisiones del 3.5% al 4.2% más alquiler mensual de equipo. Con Kuota usas tu propio celular y cobras al <strong>1% plano</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Columna Derecha: Panel de Resultados */}
            <div className={styles.calcResultPanel}>
              {mode === 'comprar' ? (
                <>
                  <div className={styles.calcSavingsHero}>
                    <div className={styles.calcSavingsTag}>
                      {buySavings > 0 ? '¡Tu Ahorro Estimado con Kuota!' : 'Financiamiento Justo'}
                    </div>
                    <div className={styles.calcSavingsValue}>
                      {buySavings > 0 ? `S/ ${buySavings.toLocaleString()}` : `S/ 0`}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-crayola-blue)', marginTop: '4px' }}>
                      {buySavings > 0 ? `frente a préstamos con TEA tradicional del 100%` : `tarifa fija transparente`}
                    </div>
                  </div>

                  <div className={styles.calcComparisonGrid}>
                    <div className={styles.calcCompCard} style={{ borderColor: 'var(--color-dodger-blue)', background: '#f0f9ff' }}>
                      <div className={styles.calcCompHeader} style={{ color: 'var(--color-dodger-blue)' }}>
                        CON KUOTA (5% ÚNICO)
                      </div>
                      <div className={styles.calcCompAmount}>
                        S/ {buyCostKuota.toLocaleString()}
                      </div>
                      <div className={styles.calcCompSub}>
                        {selectedTerm.weeks} cuotas de <strong>S/ {weeklyInstallmentKuota}</strong>/sem
                      </div>
                    </div>

                    <div className={styles.calcCompCard}>
                      <div className={styles.calcCompHeader}>
                        OTRAS PLATAFORMAS (100% TEA)
                      </div>
                      <div className={styles.calcCompAmount} style={{ color: '#64748b' }}>
                        S/ {buyCostAlt.toLocaleString()}
                      </div>
                      <div className={styles.calcCompSub}>
                        {selectedTerm.weeks} cuotas de S/ {weeklyInstallmentAlt}/sem
                      </div>
                    </div>
                  </div>

                  {/* Barra Visual */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-deep-navy)' }}>Costo Kuota vs Tradicional</span>
                      <span style={{ color: 'var(--color-dodger-blue)' }}>
                        {buyCostAlt > 0 ? `${Math.round((buyCostKuota / buyCostAlt) * 100)}% del costo usual` : '100%'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(10, buyCostAlt > 0 ? (buyCostKuota / buyCostAlt) * 100 : 50))}%`,
                          background: 'var(--color-dodger-blue)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToDownload}
                    className={styles.btnPrimary}
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <span>Pedir financiamiento en la App</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className={styles.calcFootnote}>
                    * Comparación referencial: Kuota aplica una tarifa plana única de 5% sobre el capital financiado. La alternativa se calcula con interés compuesto anual referencial (TEA 100% mercado informal/microfinanzas) según la fórmula: Monto × ((1 + 1.00)^(días/360) − 1). Redondeo a soles enteros.
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.calcSavingsHero}>
                    <div className={styles.calcSavingsTag}>
                      ¡Ahorras con Kuota cada año!
                    </div>
                    <div className={styles.calcSavingsValue}>
                      S/ {sellSavingsAnnual.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-crayola-blue)', marginTop: '4px' }}>
                      ¡Ahorro de S/ {sellSavingsMonthly.toLocaleString()} al mes en comisiones!
                    </div>
                  </div>

                  <div className={styles.calcComparisonGrid}>
                    <div className={styles.calcCompCard} style={{ borderColor: 'var(--color-dodger-blue)', background: '#f0f9ff' }}>
                      <div className={styles.calcCompHeader} style={{ color: 'var(--color-dodger-blue)' }}>
                        CON KUOTA (1%)
                      </div>
                      <div className={styles.calcCompAmount}>
                        S/ {sellCommissionMonthlyKuota.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500 }}>/mes</span>
                      </div>
                      <div className={styles.calcCompSub}>
                        S/ {sellCommissionAnnualKuota.toLocaleString()} al año
                      </div>
                    </div>

                    <div className={styles.calcCompCard}>
                      <div className={styles.calcCompHeader}>
                        OTROS POS (3.5%)
                      </div>
                      <div className={styles.calcCompAmount} style={{ color: '#64748b' }}>
                        S/ {sellCommissionMonthlyAlt.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500 }}>/mes</span>
                      </div>
                      <div className={styles.calcCompSub}>
                        S/ {sellCommissionAnnualAlt.toLocaleString()} al año
                      </div>
                    </div>
                  </div>

                  {/* Barra Visual */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-deep-navy)' }}>Comisión Kuota vs POS habitual</span>
                      <span style={{ color: 'var(--color-dodger-blue)' }}>Ahorras el 71% de comisiones</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: '28.5%', background: 'var(--color-dodger-blue)', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToDownload}
                    className={styles.btnPrimary}
                    style={{ width: '100%', padding: '12px' }}
                  >
                    <span>Empezar a cobrar con Kuota</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className={styles.calcFootnote}>
                    * Cálculo referencial: Comisión fija de 1% por cobro con tarjeta vía Kuota frente al estándar del 3.5% aplicado por terminales POS tradicionales en el mercado peruano. No incluye costos de alquiler ni mantenimiento de equipos POS tradicionales.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
