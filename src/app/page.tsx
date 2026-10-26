'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  Smartphone,
  ExternalLink,
  Sparkles,
  QrCode,
  Download,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { KuotaLogo } from '@/components/brand/KuotaLogo';
import { PaymentBanner } from '@/components/landing/PaymentBanner';
import { AppScreensMockup } from '@/components/landing/AppScreensMockup';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SavingsCalculator } from '@/components/landing/SavingsCalculator';
import { ComplaintsModal } from '@/components/landing/ComplaintsModal';
import { trackEvent } from '@/lib/analytics';
import styles from './page.module.css';

export default function KuotaLandingPage() {
  // Switch global de valor: "compra" | "vende"
  const [valueMode, setValueMode] = useState<'compra' | 'vende'>('compra');

  // Modo sincronizado de la calculadora: "comprar" | "vender"
  const [calcMode, setCalcMode] = useState<'comprar' | 'vender'>('comprar');

  // Menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal Libro de Reclamaciones
  const [complaintsModalOpen, setComplaintsModalOpen] = useState(false);

  // Sincronizar switch de valor con calculadora
  const handleValueModeChange = (mode: 'compra' | 'vende') => {
    setValueMode(mode);
    setCalcMode(mode === 'compra' ? 'comprar' : 'vender');
    trackEvent({ name: 'toggle_value_prop', value: mode });
  };

  const handleCalcModeChange = (mode: 'comprar' | 'vender') => {
    setCalcMode(mode);
    setValueMode(mode === 'comprar' ? 'compra' : 'vende');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Scroll depth tracking (25%, 50%, 75%, 100%)
  useEffect(() => {
    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrolled = (window.scrollY / docHeight) * 100;

      [25, 50, 75, 100].forEach((depth) => {
        if (scrolled >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackEvent({ name: 'scroll_depth', depth: depth as 25 | 50 | 75 | 100 });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* --------------------------------------------------------------------
          BARRA DE NAVEGACIÓN SUPERIOR (STICKY)
          -------------------------------------------------------------------- */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.navContainer}>
            {/* Logo Kuota */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <KuotaLogo height={28} />
            </Link>

            {/* Links Desktop */}
            <nav className={styles.navLinks} aria-label="Navegación principal">
              <button
                type="button"
                onClick={() => scrollToSection('beneficios')}
                className={styles.navLink}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Beneficios
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('como-funciona')}
                className={styles.navLink}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Cómo funciona
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('calculadora')}
                className={styles.navLink}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Calculadora
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('nosotros')}
                className={styles.navLink}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Nosotros
              </button>
            </nav>

            {/* Acciones */}
            <div className={styles.navActions}>
              <Link href="/dashboard" className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '14px' }}>
                Acceso Empresas
              </Link>
              <button
                type="button"
                onClick={() => {
                  scrollToSection('descarga');
                  trackEvent({ name: 'download_click', platform: 'android' });
                }}
                className={styles.btnPrimary}
                style={{ padding: '8px 18px', fontSize: '14px' }}
              >
                <Download size={15} />
                <span>Descargar App</span>
              </button>
            </div>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className={styles.mobileNavDrawer}>
            <button
              type="button"
              onClick={() => scrollToSection('beneficios')}
              className={styles.navLink}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 0' }}
            >
              Beneficios
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('como-funciona')}
              className={styles.navLink}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 0' }}
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('calculadora')}
              className={styles.navLink}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 0' }}
            >
              Calculadora de Ahorro
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('nosotros')}
              className={styles.navLink}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 0' }}
            >
              Nosotros
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <Link href="/dashboard" className={styles.btnSecondary} style={{ width: '100%' }}>
                Acceso Empresas
              </Link>
              <button
                type="button"
                onClick={() => {
                  scrollToSection('descarga');
                  trackEvent({ name: 'download_click', platform: 'android' });
                }}
                className={styles.btnPrimary}
                style={{ width: '100%' }}
              >
                <Download size={16} />
                <span>Descargar App Móvil</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------------------
          5.1 HERO SECTION
          -------------------------------------------------------------------- */}
      <section className={styles.heroSection} aria-label="Hero principal">
        <div className={styles.heroBackground} />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            {/* Tag Superior */}
            <div className={styles.heroTag}>
              <Sparkles size={14} color="#0391FD" />
              <span>Financiamiento de inventario sin presiones</span>
            </div>

            {/* H1 Display */}
            <h1 className={styles.heroTitle}>
              Confío en ti, <span className={styles.heroTitleAccent}>emprendedor</span>
            </h1>

            {/* Subtítulo */}
            <p className={styles.heroSubtitle}>
              Confiamos en emprendedores como tú, que cada día se levantan para sacar adelante a su familia. Gracias a tu trabajo, juntos podemos sacar adelante el país.
            </p>

            {/* Botones de Acción */}
            <div className={styles.heroCtas}>
              <button
                type="button"
                onClick={() => {
                  scrollToSection('beneficios');
                  trackEvent({ name: 'hero_cta_click' });
                }}
                className={styles.btnPrimary}
                style={{ padding: '12px 28px', fontSize: '16px' }}
              >
                <span>Ver más</span>
                <ChevronDown size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  scrollToSection('calculadora');
                }}
                className={styles.btnSecondary}
                style={{ padding: '12px 24px', fontSize: '16px' }}
              >
                <span>Calcular mi ahorro</span>
              </button>
            </div>

            {/* Metadatos de Confianza */}
            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <ShieldCheck size={16} color="#0391FD" />
                <span>5% cobro único</span>
              </div>
              <span>•</span>
              <div className={styles.heroMetaItem}>
                <CheckCircle2 size={16} color="#0391FD" />
                <span>Pagos semanales flexibles</span>
              </div>
              <span>•</span>
              <div className={styles.heroMetaItem}>
                <Store size={16} color="#0391FD" />
                <span>1% comisión para vender</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5.2 PROPUESTA DE VALOR CON SWITCH COMPRA / VENDE
          -------------------------------------------------------------------- */}
      <section id="beneficios" className={styles.valuePropSection} aria-label="Propuesta de valor">
        <div className={styles.container}>
          {/* Switch Segmented Control */}
          <div className={styles.switchContainer}>
            <div className={styles.segmentedControl} role="tablist" aria-label="Cambiar entre modo compra y venta">
              <button
                type="button"
                role="tab"
                aria-selected={valueMode === 'compra'}
                className={`${styles.segmentTab} ${valueMode === 'compra' ? styles.segmentTabActive : ''}`}
                onClick={() => handleValueModeChange('compra')}
              >
                <ShoppingBag size={18} />
                <span>Compra</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={valueMode === 'vende'}
                className={`${styles.segmentTab} ${valueMode === 'vende' ? styles.segmentTabActive : ''}`}
                onClick={() => handleValueModeChange('vende')}
              >
                <Store size={18} />
                <span>Vende</span>
              </button>
            </div>
          </div>

          {/* Grid de 2 Columnas */}
          <div className={styles.valuePropGrid}>
            {/* Columna de Texto */}
            <div className={styles.valuePropTextCol}>
              {valueMode === 'compra' ? (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#ffffff',
                        border: '1px solid rgba(0, 35, 92, 0.15)',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'var(--color-dodger-blue)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Para Bodegas y Comercios Compradores
                    </span>
                  </div>

                  <h2 className={styles.propHeadingH1}>
                    No más préstamos abusivos, ni presiones
                  </h2>

                  <p className={styles.propHeadingH2}>
                    Compra en tu proveedor de confianza y tú decides en cuánto tiempo pagar. Pagos semanales, sin intereses abusivos.
                  </p>

                  {/* Tarjeta de Tasa Comparativa */}
                  <div
                    className={styles.rateComparisonCard}
                    role="region"
                    aria-label="Antes 100% TEA en otras plataformas, con Kuota 5% de cobro único"
                  >
                    <div className={styles.rateComparisonHeader}>
                      <span className={styles.rateComparisonTitle}>Comparativa de Financiamiento</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-dodger-blue)', fontWeight: 600 }}>
                        Sin letra chica
                      </span>
                    </div>

                    <div className={styles.rateColumns}>
                      <div className={styles.rateColOld}>
                        <div className={styles.oldRateStriked} aria-hidden="true">
                          100% TEA
                        </div>
                        <div className={styles.rateLabel}>Otras plataformas y prestamistas</div>
                      </div>

                      <div className={styles.rateColKuota}>
                        <div className={styles.kuotaRateNew}>
                          5% <span style={{ fontSize: '18px', fontWeight: 600 }}>cobro único</span>
                        </div>
                        <div className={styles.kuotaRateBadge}>
                          Con Kuota
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => scrollToSection('calculadora')}
                      className={styles.btnSecondary}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <span>Simular mis compras</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: '#ffffff',
                        border: '1px solid rgba(0, 35, 92, 0.15)',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'var(--color-dodger-blue)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Para Proveedores y Vendedores
                    </span>
                  </div>

                  <h2 className={styles.propHeadingH1}>
                    Crece y ahorra
                  </h2>

                  <p className={styles.propHeadingH2}>
                    Acepta que tus clientes paguen con sus tarjetas, sin pagar comisiones excesivas por transacción.
                  </p>

                  {/* Tarjeta de Tasa Comparativa Vende */}
                  <div
                    className={styles.rateComparisonCard}
                    role="region"
                    aria-label="Antes 3.5% en otros POS, con Kuota 1% de cobro"
                  >
                    <div className={styles.rateComparisonHeader}>
                      <span className={styles.rateComparisonTitle}>Comisión por Cobro con Tarjeta</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-dodger-blue)', fontWeight: 600 }}>
                        Ahorro del 70%
                      </span>
                    </div>

                    <div className={styles.rateColumns}>
                      <div className={styles.rateColOld}>
                        <div className={styles.oldRateStriked} aria-hidden="true">
                          3.5%
                        </div>
                        <div className={styles.rateLabel}>Otros terminales POS tradicionales</div>
                      </div>

                      <div className={styles.rateColKuota}>
                        <div className={styles.kuotaRateNew}>
                          1% <span style={{ fontSize: '18px', fontWeight: 600 }}>con Kuota</span>
                        </div>
                        <div className={styles.kuotaRateBadge}>
                          Sin costo de alquiler de POS
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => scrollToSection('calculadora')}
                      className={styles.btnSecondary}
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <span>Simular mis cobros</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Columna de Captura / Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AppScreensMockup mode={valueMode} />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5.3 BANNER DE MEDIOS DE PAGO
          -------------------------------------------------------------------- */}
      <PaymentBanner />

      {/* --------------------------------------------------------------------
          5.4 CÓMO FUNCIONA
          -------------------------------------------------------------------- */}
      <HowItWorks />

      {/* --------------------------------------------------------------------
          5.5 CALCULADORA DE AHORRO INTERACTIVA
          -------------------------------------------------------------------- */}
      <SavingsCalculator
        mode={calcMode}
        onModeChange={handleCalcModeChange}
        onNavigateToDownload={() => {
          scrollToSection('descarga');
          trackEvent({ name: 'download_click', platform: 'android' });
        }}
      />

      {/* --------------------------------------------------------------------
          5.6 NOSOTROS
          -------------------------------------------------------------------- */}
      <section id="nosotros" className={styles.teamSection} aria-label="Sobre el equipo de Kuota">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPretitle}>Nuestra Misión</span>
            <h2 className={styles.sectionTitle}>
              Nosotros
            </h2>
          </div>

          {/* Manifiesto */}
          <div className={styles.teamManifesto}>
            <p className={styles.teamManifestoText}>
              &ldquo;Somos un equipo de emprendedores que hemos vivido lo difícil que es crecer en un país donde nadie confía en ti y todos te dan la espalda cuando más lo necesitas. Creemos firmemente que todo emprendedor merece la oportunidad de crecer y sacar adelante su negocio.&rdquo;
            </p>
          </div>

          {/* Cards del Equipo */}
          <div className={styles.teamGrid}>
            {/* José González */}
            <div className={styles.teamCard}>
              <img
                src="/team/jose-gonzalez.png"
                alt="José González — CTO & Co-Founder de Kuota"
                className={styles.teamAvatarImg}
              />
              <h3 className={styles.teamName}>José González</h3>
              <span className={styles.teamRole}>CTO & Co-Founder</span>
              <a
                href="https://www.linkedin.com/in/jmgonzalezz/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: 'team_linkedin_click', person: 'Jose Gonzalez' })}
                className={styles.linkedinBtn}
                aria-label="Perfil de LinkedIn de José González"
              >
                <span>LinkedIn</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Josué Lovatón */}
            <div className={styles.teamCard}>
              <img
                src="/team/josue-lovaton.png"
                alt="Josué Lovatón — CEO & Co-Founder de Kuota"
                className={styles.teamAvatarImg}
              />
              <h3 className={styles.teamName}>Josué Lovatón</h3>
              <span className={styles.teamRole}>CEO & Co-Founder</span>
              <a
                href="https://www.linkedin.com/in/josu%C3%A9-lovat%C3%B3n/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: 'team_linkedin_click', person: 'Josue Lovaton' })}
                className={styles.linkedinBtn}
                aria-label="Perfil de LinkedIn de Josué Lovatón"
              >
                <span>LinkedIn</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Rolando Quiroz */}
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-deep-navy)' }}>RQ</span>
              </div>
              <h3 className={styles.teamName}>Rolando Quiroz</h3>
              <span className={styles.teamRole}>Advisor</span>
              <a
                href="https://www.linkedin.com/in/rolando-quiroz-miraval-95085323/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ name: 'team_linkedin_click', person: 'Rolando Quiroz' })}
                className={styles.linkedinBtn}
                aria-label="Perfil de LinkedIn de Rolando Quiroz"
              >
                <span>LinkedIn</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5.7 CARD DE DESCARGA (CTA FINAL)
          -------------------------------------------------------------------- */}
      <section id="descarga" className={styles.downloadSection} aria-label="Descargar Kuota">
        <div className={styles.container}>
          <div className={styles.downloadCard}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'var(--color-status-green)',
                color: 'var(--color-deep-navy)',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Comienza hoy mismo
            </span>

            <h2 className={styles.downloadTitle}>
              Descarga la aplicación y empieza a crecer
            </h2>

            <p className={styles.downloadDesc}>
              Descarga, completa tu perfil y empieza a financiar tu crecimiento a kuotas.
            </p>

            <div className={styles.downloadActionsRow}>
              {/* Botón Google Play */}
              <a
                href="#descarga"
                onClick={(e) => {
                  e.preventDefault();
                  trackEvent({ name: 'download_click', platform: 'android' });
                  alert('La aplicación de Kuota para Android estará disponible en Google Play Store.');
                }}
                className={styles.storeButton}
                aria-label="Descargar en Google Play"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.61-1.424V3.238c0-.547.22-1.042.61-1.424zM15.207 13.414l2.586-2.586-10.97-6.27 8.384 8.856zm0-2.828L6.823 1.73l10.97 6.27-2.586 2.586zm1.414 1.414l3.187 1.821c.883.505.883 1.332 0 1.836l-3.187 1.822-2.399-2.399 2.399-2.08z" />
                </svg>
                <div>
                  <span className={styles.storeButtonSub}>Disponible en</span>
                  <span className={styles.storeButtonMain}>Google Play</span>
                </div>
              </a>

              {/* Botón App Store / Próximamente */}
              <div className={styles.storeButtonOutline}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.01.6-2.65 1.35-.57.65-1.06 1.73-.93 2.76 1.02.08 2.06-.51 2.66-1.24z" />
                </svg>
                <div>
                  <span className={styles.storeButtonSub}>Próximamente en</span>
                  <span className={styles.storeButtonMain}>App Store</span>
                </div>
              </div>
            </div>

            {/* QR Desktop */}
            <div className={styles.qrContainer}>
              <div className={styles.qrBox}>
                <QrCode size={110} color="#00235C" />
              </div>
              <span className={styles.qrLabel}>Escanea con tu celular para descargar la app</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5.8 INSTITUCIONES QUE CONFÍAN EN NOSOTROS
          -------------------------------------------------------------------- */}
      <section className={styles.trustSection} aria-label="Instituciones aliadas">
        <div className={styles.container}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-dodger-blue)' }}>
              Alianzas y Respaldo
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 300, color: 'var(--color-deep-navy)', margin: '8px 0 0' }}>
              Instituciones que confían en nosotros
            </h2>
          </div>

          <div className={styles.trustGrid}>
            {/* Universidad Científica del Sur */}
            <div className={styles.trustPartnerCard} title="Universidad Científica del Sur">
              <Building2 size={24} color="#0391FD" />
              <div>
                <div style={{ fontSize: '15px', color: '#00235C', fontWeight: 700 }}>Universidad Científica del Sur</div>
                <div style={{ fontSize: '11px', color: 'rgba(47, 122, 239, 0.7)', fontWeight: 500 }}>Incubadora & Alianza Estratégica</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5.9 FOOTER
          -------------------------------------------------------------------- */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Columna Marca */}
            <div className={styles.footerCol}>
              <KuotaLogo height={28} />
              <p style={{ fontSize: '14px', color: 'rgba(47, 122, 239, 0.85)', lineHeight: 1.6, margin: '8px 0 0' }}>
                Financiamiento en cuotas semanales para inventario de bodegas y herramientas de cobro con tarjeta sin comisiones excesivas.
              </p>
              <div style={{ fontSize: '13px', color: 'var(--color-deep-navy)', fontWeight: 600, marginTop: '8px' }}>
                Hecho en Perú para emprendedores peruanos 🇵🇪
              </div>
            </div>

            {/* Columna Navegación */}
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Plataforma</span>
              <button
                type="button"
                onClick={() => scrollToSection('beneficios')}
                className={styles.footerLink}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Beneficios para Comprar
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('beneficios')}
                className={styles.footerLink}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Beneficios para Vender
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('como-funciona')}
                className={styles.footerLink}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Cómo funciona
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('calculadora')}
                className={styles.footerLink}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Calculadora de Ahorro
              </button>
            </div>

            {/* Columna Legal */}
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Legal y Transparencia</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Términos y condiciones de uso del servicio Kuota v1.'); }} className={styles.footerLink}>
                Términos del Servicio
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Política de privacidad y tratamiento de datos personales conforme a Ley N° 29733.'); }} className={styles.footerLink}>
                Política de Privacidad
              </a>
              <button
                type="button"
                onClick={() => setComplaintsModalOpen(true)}
                className={styles.footerLink}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-deep-navy)', fontWeight: 600 }}
              >
                📖 Libro de Reclamaciones
              </button>
            </div>

            {/* Columna Contacto */}
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Contacto</span>
              <a href="mailto:contacto@kuota.pe" className={styles.footerLink}>
                contacto@kuota.pe
              </a>
              <span style={{ fontSize: '13px', color: 'rgba(47, 122, 239, 0.7)' }}>
                Lima, Perú
              </span>
              <div style={{ marginTop: '12px' }}>
                <Link href="/dashboard" className={styles.btnSecondary} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Panel Administrativo
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.footerBottom}>
            <div>
              © 2026 Kuota Technologies Inc. Todos los derechos reservados.
            </div>
            <div style={{ fontSize: '12px' }}>
              Tarifa transparente · Sin comisiones sorpresa · 100% digital
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Libro de Reclamaciones */}
      <ComplaintsModal
        isOpen={complaintsModalOpen}
        onClose={() => setComplaintsModalOpen(false)}
      />
    </div>
  );
}
