export type OfferId = 'monthly' | 'yearly'
export interface Offer {
  id: OfferId
  title: string
  period: 'month' | 'year'
  priceMinor: number
  currency: 'RUB'
  months: number
  recommended: boolean
}
export interface PurchaseResponse {
  id: string
  offerId: OfferId
  createdAt: string
  deviceId: string
  test: true
}
export interface RestoreResponse {
  found: boolean
  purchase: PurchaseResponse | null
}
