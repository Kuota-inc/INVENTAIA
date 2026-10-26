'use client';

import React from 'react';
import { QrCode, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Smartphone, Calendar, TrendingUp } from 'lucide-react';
import styles from '@/app/page.module.css';

interface AppScreensMockupProps {
  mode: 'compra' | 'vende' | 'step1' | 'step2' | 'step3';
}

export function AppScreensMockup({ mode }: AppScreensMockupProps) {
  if (mode === 'vende' || mode === 'step2') {
    return (
      <div className={styles.mockupCard}>
        {/* Device Top Bar */}
        <div className={styles.mockupHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} />
            <span>Kuota POS · Cobrar</span>
          </div>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>9:41 AM</span>
        </div>

        {/* Screen Content */}
        <div className={`${styles.mockupBody} ${styles.mockupContentAnim}`} key={mode}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid rgba(0, 35, 92, 0.12)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(47, 122, 239, 0.7)', textTransform: 'uppercase', fontWeight: 600 }}>Monto a cobrar</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0 12px' }}>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#00235C' }}>S/</span>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#00235C' }}>280.00</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(0, 35, 92, 0.08)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'rgba(47, 122, 239, 0.7)' }}>Comisión Kuota (1%):</span>
                <span style={{ fontWeight: 700, color: '#00235C' }}>S/ 2.80</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>Comisión otros POS (3.5%):</span>
                <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>S/ 9.80</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: '#e0f2fe', padding: '4px 8px', borderRadius: '6px' }}>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>¡Ahorras en este cobro!:</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>S/ 7.00</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0, 35, 92, 0.12)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00235C', marginBottom: '8px' }}>
              Celular del cliente para link de pago:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fbfe', border: '1px solid rgba(0, 35, 92, 0.15)', borderRadius: '6px', padding: '8px 12px' }}>
              <Smartphone size={16} color="#0391FD" style={{ marginRight: '8px' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#00235C' }}>987 654 321</span>
            </div>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#00235C',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span>Generar link de cobro seguro</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#059669' }}>
            <CheckCircle2 size={14} />
            <span>Fondos liquidados directamente a tu cuenta bancaria</span>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'step3') {
    return (
      <div className={styles.mockupCard}>
        {/* Device Top Bar */}
        <div className={styles.mockupHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} />
            <span>Kuota · Mis Kuotas y Línea</span>
          </div>
          <span style={{ fontSize: '11px', opacity: 0.8 }}>9:41 AM</span>
        </div>

        {/* Screen Content */}
        <div className={`${styles.mockupBody} ${styles.mockupContentAnim}`} key={mode}>
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid rgba(0, 35, 92, 0.12)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(47, 122, 239, 0.7)', textTransform: 'uppercase', fontWeight: 600 }}>Línea disponible</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0 8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#00235C' }}>S/</span>
              <span style={{ fontSize: '30px', fontWeight: 800, color: '#00235C' }}>4,500.00</span>
            </div>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} />
              <span>Nivel Emprendedor Oro (+25% por buen pago)</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0, 35, 92, 0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00235C' }}>Próxima kuota semanal</span>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Vence en 4 días</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#00235C' }}>S/ 262.50</div>
                <div style={{ fontSize: '11px', color: 'rgba(47, 122, 239, 0.7)' }}>Kuotas 3 de 4 · Distribuidora San Juan</div>
              </div>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#00235C',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Pagar vía Yape
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', fontSize: '12px', color: '#1e40af' }}>
            <ShieldCheck size={16} />
            <span>Al pagar puntual desbloqueas hasta S/ 10,000 en tu siguiente pedido.</span>
          </div>
        </div>
      </div>
    );
  }

  // Default mode: 'compra' or 'step1'
  return (
    <div className={styles.mockupCard}>
      {/* Device Top Bar */}
      <div className={styles.mockupHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={16} />
          <span>Kuota · Escanear QR Proveedor</span>
        </div>
        <span style={{ fontSize: '11px', opacity: 0.8 }}>9:41 AM</span>
      </div>

      {/* Screen Content */}
      <div className={`${styles.mockupBody} ${styles.mockupContentAnim}`} key={mode}>
        {/* QR Scan Simulation */}
        <div
          style={{
            background: 'linear-gradient(135deg, #00235C 0%, #0391FD 100%)',
            borderRadius: '12px',
            padding: '18px',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              border: '2px dashed rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <QrCode size={48} color="#ffffff" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Distribuidora San Juan SAC</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>Proveedor Verificado Kuota</span>
        </div>

        {/* Plan Breakdown */}
        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0, 35, 92, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(47, 122, 239, 0.7)' }}>Monto mercadería:</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#00235C' }}>S/ 1,000.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(47, 122, 239, 0.7)' }}>Cargo único Kuota (5%):</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0391FD' }}>+ S/ 50.00</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(0, 35, 92, 0.08)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#00235C' }}>4 Kuotas semanales de:</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#00235C' }}>S/ 262.50</span>
          </div>
        </div>

        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#00235C',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <span>Confirmar financiamiento</span>
          <ArrowRight size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#059669' }}>
          <CheckCircle2 size={14} />
          <span>Sin intereses abusivos · Aprobación en segundos</span>
        </div>
      </div>
    </div>
  );
}
