'use client';

import React, { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { AppScreensMockup } from './AppScreensMockup';
import styles from '@/app/page.module.css';

interface Step {
  id: 1 | 2 | 3;
  title: string;
  desc: string;
  mode: 'step1' | 'step2' | 'step3';
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Escanea y financia en segundos',
    desc: 'Escanea el QR en tu proveedor más cercano, define el número de kuotas semanales y confirma tu compra.',
    mode: 'step1',
  },
  {
    id: 2,
    title: 'Tus clientes pagan desde su teléfono de forma segura',
    desc: 'Genera links de cobro o QR para tus ventas. Tu cliente paga con tarjeta o billeteras sin recargos abusivos.',
    mode: 'step2',
  },
  {
    id: 3,
    title: 'Paga a tiempo y recibe más',
    desc: 'Cada kuota completada incrementa tu historial y te abre acceso a mayor capital para hacer crecer tu inventario.',
    mode: 'step3',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState<Step>(STEPS[0]);

  const selectStep = (step: Step) => {
    setActiveStep(step);
    trackEvent({ name: 'how_it_works_chip', chip: step.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % STEPS.length;
      selectStep(STEPS[nextIndex]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + STEPS.length) % STEPS.length;
      selectStep(STEPS[prevIndex]);
    }
  };

  return (
    <section id="como-funciona" className={styles.howItWorksSection} aria-label="Cómo funciona Kuota">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPretitle}>Paso a Paso</span>
          <h2 className={styles.sectionTitle}>
            Cómo funciona <span style={{ color: 'var(--color-dodger-blue)', fontWeight: 400 }}>Kuota</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Diseñado especialmente para bodegas, distribuidores y comercios independientes. Sin trámites engorrosos.
          </p>
        </div>

        <div className={styles.howItWorksGrid}>
          {/* Mockup Dinámico en la izquierda */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ transition: 'opacity 0.25s ease', width: '100%' }}>
              <AppScreensMockup mode={activeStep.mode} />
            </div>
          </div>

          {/* Chips Interactivos a la derecha */}
          <div className={styles.chipsStack} role="tablist" aria-label="Pasos de funcionamiento">
            {STEPS.map((step, idx) => {
              const isActive = activeStep.id === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onClick={() => selectStep(step)}
                  className={`${styles.stepChip} ${isActive ? styles.stepChipActive : ''}`}
                >
                  <div className={styles.chipNumber}>{step.id}</div>
                  <div className={styles.chipContent}>
                    <h3 className={styles.chipTitle}>{step.title}</h3>
                    <p className={styles.chipDesc}>{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
