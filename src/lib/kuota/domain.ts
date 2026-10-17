export const MAX_AMOUNT_CENTS = 999_999_999_999;

export function presentKuotaSale<T extends { status: string }>(sale: T) {
  return {
    ...sale,
    status: sale.status === 'COMPROBADA' ? 'PRODUCT_MATCH' : 'NO_PRODUCT_MATCH',
    matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
    paymentProviderVerified: false,
  };
}

export function parseAmountCents(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value).trim();
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(text)) return null;

  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_AMOUNT_CENTS ? cents : null;
}

export function formatAmountCents(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

export function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[\da-f]{64}$/i.test(value);
}

export function normalizeDetectedAt(value: unknown, now = Date.now()): string | null {
  if (typeof value !== 'string' || value.length > 40) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || timestamp < now - 30 * 24 * 60 * 60 * 1000 ||
      timestamp > now + 5 * 60 * 1000) {
    return null;
  }
  return new Date(timestamp).toISOString();
}

export function isValidTermDays(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 3650;
}

export function makeKuotaQrPayload(supplierId: string): string {
  return `kuota://pay?v=1&supplierId=${encodeURIComponent(supplierId)}`;
}

export function isConfirmationWindowExpired(timeoutAt: string, now = Date.now()): boolean {
  const timestamp = Date.parse(timeoutAt);
  return Number.isFinite(timestamp) && timestamp <= now;
}
