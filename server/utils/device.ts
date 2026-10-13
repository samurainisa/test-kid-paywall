import { randomUUID } from 'node:crypto'
import { getCookie, setCookie, getRequestURL, setResponseHeader, type H3Event } from 'h3'

export function isUUID(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
export function getDeviceId(event: H3Event): string {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const existing = getCookie(event, 'paywall_device')
  if (isUUID(existing)) return existing.toLowerCase()
  const id = randomUUID()
  setCookie(event, 'paywall_device', id, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
    secure: getRequestURL(event, { xForwardedProto: true }).protocol === 'https:',
  })
  return id
}
