'use client';

import React from 'react';
import styles from '@/app/page.module.css';

export function PaymentBanner() {
  return (
    <section className={styles.paymentBanner} aria-label="Medios de pago y transferencias aceptadas">
      <div className={styles.container}>
        <div className={styles.paymentBannerInner}>
          <span className={styles.paymentLabel}>Medios de pago y bancos integrados:</span>
          <div className={styles.paymentLogosTrack}>
            {/* Yape */}
            <div className={styles.paymentLogoBadge} title="Yape">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="8" fill="#742284" />
                <path d="M12 14L18 24V30H22V24L28 14H23.5L20 20L16.5 14H12Z" fill="#00D2B5" />
              </svg>
              <span>Yape</span>
            </div>

            {/* Plin */}
            <div className={styles.paymentLogoBadge} title="Plin">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="8" fill="#00A9E0" />
                <circle cx="20" cy="20" r="10" fill="#FFD100" />
                <path d="M16 20C16 17.79 17.79 16 20 16C22.21 16 24 17.79 24 20" stroke="#00235C" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span>Plin</span>
            </div>

            {/* BCP */}
            <div className={styles.paymentLogoBadge} title="BCP">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="8" fill="#002A8F" />
                <path d="M11 20L19 12H29L21 20L29 28H19L11 20Z" fill="#FF7800" />
              </svg>
              <span>BCP</span>
            </div>

            {/* BBVA */}
            <div className={styles.paymentLogoBadge} title="BBVA">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="40" height="40" rx="8" fill="#004481" />
                <text x="7" y="26" fill="#ffffff" fontFamily="sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.05em">BBVA</text>
              </svg>
              <span>BBVA</span>
            </div>

            {/* Tarjetas */}
            <div className={styles.paymentLogoBadge} title="Tarjetas Visa y Mastercard">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              <span>Visa / Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
