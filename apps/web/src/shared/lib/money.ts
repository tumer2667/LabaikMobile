import { appConfig } from '@/shared/config/env'

/** Format minor units (paisa) as PKR display. 100 = ₨1.00 */
export function formatPkrFromMinor(amountMinor: number): string {
  const major = amountMinor / 100
  return new Intl.NumberFormat(appConfig.locale === 'en' ? 'en-PK' : appConfig.locale, {
    style: 'currency',
    currency: appConfig.currency,
    maximumFractionDigits: 0,
  }).format(major)
}

/** Format major PKR units (whole rupees) for display. */
export function formatPkr(amountMajor: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amountMajor)
}
