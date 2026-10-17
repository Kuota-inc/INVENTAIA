export type KuotaDocumentType = 'DNI' | 'RUC';

export interface KuotaBusinessProfile {
  identityDocumentType: KuotaDocumentType;
  identityDocumentNumber: string;
  legalName: string;
  address: string;
  phone: string;
}

export function parseKuotaBusinessProfile(
  body: Record<string, unknown> | null
): KuotaBusinessProfile | null {
  if (!body) return null;

  const identityDocumentType =
    body.identityDocumentType === 'DNI' || body.identityDocumentType === 'RUC'
      ? body.identityDocumentType
      : null;
  const identityDocumentNumber =
    typeof body.identityDocumentNumber === 'string' ? body.identityDocumentNumber.trim() : '';
  const legalName = typeof body.legalName === 'string' ? body.legalName.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const phoneInput = typeof body.phone === 'string' ? body.phone.trim() : '';
  const phone = phoneInput.replace(/[\s().-]/g, '');
  const documentIsValid = identityDocumentType === 'DNI'
    ? /^\d{8}$/.test(identityDocumentNumber)
    : identityDocumentType === 'RUC' && /^\d{11}$/.test(identityDocumentNumber);

  if (
    !identityDocumentType ||
    !documentIsValid ||
    legalName.length < 1 ||
    legalName.length > 255 ||
    address.length < 1 ||
    address.length > 250 ||
    !/^\+?\d{7,15}$/.test(phone)
  ) {
    return null;
  }

  return {
    identityDocumentType,
    identityDocumentNumber,
    legalName,
    address,
    phone,
  };
}
