import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatAmountCents,
  isConfirmationWindowExpired,
  isSha256,
  isUuid,
  isValidTermDays,
  makeKuotaQrPayload,
  normalizeDetectedAt,
  parseAmountCents,
  presentKuotaSale,
} from '../src/lib/kuota/domain.ts';
import { parseKuotaBusinessProfile } from '../src/lib/kuota/profile.ts';

test('amount parsing uses exact cents and rejects invalid or overflowing amounts', () => {
  assert.equal(parseAmountCents('19.9'), 1990);
  assert.equal(parseAmountCents(0.01), 1);
  assert.equal(formatAmountCents(1990), '19.90');
  assert.equal(parseAmountCents('9999999999.99'), 999999999999);
  assert.equal(formatAmountCents(999999999999), '9999999999.99');
  assert.equal(parseAmountCents(0), null);
  assert.equal(parseAmountCents('1.001'), null);
  assert.equal(parseAmountCents('1e3'), null);
  assert.equal(parseAmountCents('10000000000'), null);
});

test('notification metadata validation rejects stale and future timestamps', () => {
  const now = Date.parse('2026-10-20T12:00:00.000Z');
  assert.equal(
    normalizeDetectedAt('2026-10-20T11:59:00.000Z', now),
    '2026-10-20T11:59:00.000Z'
  );
  assert.equal(normalizeDetectedAt('2026-09-01T12:00:00.000Z', now), null);
  assert.equal(normalizeDetectedAt('2026-10-20T12:10:00.000Z', now), null);
});

test('QR identifiers and request idempotency inputs are validated', () => {
  const supplierId = 'fa71b12b-31d2-430c-b2da-342f5ca3e956';
  assert.equal(isUuid(supplierId), true);
  assert.equal(isUuid('not-a-uuid'), false);
  assert.equal(isSha256('a'.repeat(64)), true);
  assert.equal(isSha256('x'.repeat(64)), false);
  assert.equal(makeKuotaQrPayload(supplierId), `kuota://pay?v=1&supplierId=${supplierId}`);
  assert.equal(isValidTermDays(30), true);
  assert.equal(isValidTermDays(0), false);
  assert.equal(isValidTermDays('30'), false);
});

test('confirmation timeout is derived consistently at its boundary', () => {
  const now = Date.parse('2026-10-20T12:00:00.000Z');
  assert.equal(isConfirmationWindowExpired('2026-10-20T12:00:00.000Z', now), true);
  assert.equal(isConfirmationWindowExpired('2026-10-20T12:00:01.000Z', now), false);
});

test('business profiles validate Peruvian identity documents and normalize phone formatting', () => {
  assert.deepEqual(
    parseKuotaBusinessProfile({
      identityDocumentType: 'RUC',
      identityDocumentNumber: '20123456789',
      legalName: '  Negocio SAC ',
      address: ' Lima ',
      phone: '+51 (987) 654-321',
    }),
    {
      identityDocumentType: 'RUC',
      identityDocumentNumber: '20123456789',
      legalName: 'Negocio SAC',
      address: 'Lima',
      phone: '+51987654321',
    }
  );
  assert.equal(
    parseKuotaBusinessProfile({
      identityDocumentType: 'DNI',
      identityDocumentNumber: '1234567',
      legalName: 'Negocio',
      address: 'Lima',
      phone: '987654321',
    }),
    null
  );
  assert.equal(
    parseKuotaBusinessProfile({
      identityDocumentType: 'RUC',
      identityDocumentNumber: '20123456789',
      legalName: 'Negocio',
      address: 'Lima',
      phone: 'abc',
    }),
    null
  );
});

test('sale responses distinguish product matching from payment verification', () => {
  assert.deepEqual(
    presentKuotaSale({ id: 'sale-1', status: 'COMPROBADA' }),
    {
      id: 'sale-1',
      status: 'PRODUCT_MATCH',
      matchingMethod: 'CLIENT_NOTIFICATION_AMOUNT_MATCH',
      paymentProviderVerified: false,
    }
  );
  assert.equal(presentKuotaSale({ status: 'NO_COMPROBADA' }).status, 'NO_PRODUCT_MATCH');
});
