import type { Offer } from '../types/paywall'

// Ordinary spaces match the supplied design. Price blocks prevent wrapping.
export function formatRubles(priceMinor: number): string {
  return `${Math.round(priceMinor / 100).toLocaleString('ru-RU').replace(/\u00a0|\u202f/g, ' ')} ₽`
}
export function offerCaption(offer: Offer): string {
  return offer.period === 'year' ? `${formatRubles(Math.round(offer.priceMinor / offer.months / 100) * 100)} в месяц` : 'в месяц'
}
