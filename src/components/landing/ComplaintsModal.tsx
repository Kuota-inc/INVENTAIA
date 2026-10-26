'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import styles from '@/app/page.module.css';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintsModal({ isOpen, onClose }: ComplaintsModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [email, setEmail] = useState('');
  const [detail, setDetail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modalCard}>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            onClose();
          }}
          className={styles.modalCloseBtn}
          aria-label="Cerrar ventana"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px', color: '#00235C' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 id="modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#00235C' }}>
                  Libro de Reclamaciones Virtual
                </h3>
                <span style={{ fontSize: '12px', color: 'rgba(47, 122, 239, 0.7)' }}>
                  Conforme a las disposiciones del Código de Protección al Consumidor (Ley N° 29571)
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#00235C', marginBottom: '4px' }}>
                  Nombres y Apellidos:
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez Quispe"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 35, 92, 0.2)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#00235C', marginBottom: '4px' }}>
                    DNI / CE:
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="8 dígitos"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 35, 92, 0.2)',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#00235C', marginBottom: '4px' }}>
                    Correo electrónico:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 35, 92, 0.2)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#00235C', marginBottom: '4px' }}>
                  Detalle del Reclamo o Queja:
                </label>
                <textarea
                  required
                  rows={4}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Describe claramente los hechos ocurridos..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 35, 92, 0.2)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11px', color: 'rgba(47, 122, 239, 0.8)' }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI. Plazo de atención: máximo 15 días hábiles.
                </span>
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                style={{ width: '100%', marginTop: '6px' }}
              >
                Enviar Hoja de Reclamación
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: '#dcfce7', borderRadius: '9999px', color: '#166534', marginBottom: '16px' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#00235C', marginBottom: '8px' }}>
              Reclamación Registrada
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(47, 122, 239, 0.9)', lineHeight: 1.5, marginBottom: '24px' }}>
              Hemos recibido tu registro con código correlativo <strong>#KUO-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>. Una copia formal ha sido remitida a <strong>{email}</strong>. Nuestro equipo de atención te responderá a la brevedad.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className={styles.btnPrimary}
              style={{ padding: '10px 24px' }}
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
