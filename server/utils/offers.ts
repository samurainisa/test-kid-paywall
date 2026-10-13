import type { Offer } from '../../shared/types/paywall'

export const offers: readonly Offer[] = Object.freeze([
  { id: 'monthly', title: 'На месяц', period: 'month', priceMinor: 29900, currency: 'RUB', months: 1, recommended: false },
  { id: 'yearly', title: 'На год', period: 'year', priceMinor: 199000, currency: 'RUB', months: 12, recommended: true },
])
