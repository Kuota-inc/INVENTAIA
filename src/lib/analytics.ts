/**
 * Kuota Landing Page Analytics helper
 * PRD Sección 6: Eventos de analítica
 */

export type AnalyticsEvent =
  | { name: 'hero_cta_click' }
  | { name: 'toggle_value_prop'; value: 'compra' | 'vende' }
  | { name: 'how_it_works_chip'; chip: 1 | 2 | 3 }
  | { name: 'calculator_mode'; mode: 'comprar' | 'vender' }
  | { name: 'calculator_use'; amount: number; term?: string }
  | { name: 'team_linkedin_click'; person: string }
  | { name: 'download_click'; platform: 'android' | 'ios' | 'qr' }
  | { name: 'scroll_depth'; depth: 25 | 50 | 75 | 100 };

declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  // Log en desarrollo para verificación
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics Event]', event);
  }

  // Push to GTM / GA4 dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: event.name,
    ...('value' in event && { value: event.value }),
    ...('chip' in event && { chip: event.chip }),
    ...('mode' in event && { mode: event.mode }),
    ...('amount' in event && { amount: event.amount }),
    ...('term' in event && { term: event.term }),
    ...('person' in event && { person: event.person }),
    ...('platform' in event && { platform: event.platform }),
    ...('depth' in event && { depth: event.depth }),
    timestamp: new Date().toISOString(),
  });

  // Meta Pixel compatible si existe
  if (typeof window.fbq === 'function') {
    if (event.name === 'download_click') {
      window.fbq('track', 'Lead', { content_name: event.platform });
    }
  }
}
