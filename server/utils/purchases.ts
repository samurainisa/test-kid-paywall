import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { Offer, OfferId, PurchaseResponse } from '../../shared/types/paywall'
import { getDb } from './db'

interface PurchaseRow {
  id: string
  offer_id: OfferId
  device_id: string
  request_id: string
  price_minor: number
  currency: string
  created_at: string
}
function toResponse(row: PurchaseRow): PurchaseResponse {
  return { id: row.id, offerId: row.offer_id, deviceId: row.device_id, createdAt: row.created_at, test: true }
}
export function savePurchase(deviceId: string, requestId: string, offer: Offer) {
  const db = getDb()
  return db.transaction(() => {
    const existing = db.prepare('SELECT * FROM purchases WHERE device_id = ? AND request_id = ?').get(deviceId, requestId) as PurchaseRow | undefined
    if (existing) {
      if (existing.offer_id !== offer.id) throw createError({ statusCode: 409, statusMessage: 'Request ID belongs to another offer' })
      return { purchase: toResponse(existing), created: false }
    }
    const row: PurchaseRow = {
      id: randomUUID(), offer_id: offer.id, device_id: deviceId, request_id: requestId,
      price_minor: offer.priceMinor, currency: offer.currency, created_at: new Date().toISOString(),
    }
    db.prepare(`INSERT INTO purchases (id, offer_id, device_id, request_id, price_minor, currency, created_at)
      VALUES (@id, @offer_id, @device_id, @request_id, @price_minor, @currency, @created_at)`).run(row)
    return { purchase: toResponse(row), created: true }
  }).immediate()
}
export function restorePurchase(deviceId: string): PurchaseResponse | null {
  const row = getDb().prepare('SELECT * FROM purchases WHERE device_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1').get(deviceId) as PurchaseRow | undefined
  return row ? toResponse(row) : null
}
