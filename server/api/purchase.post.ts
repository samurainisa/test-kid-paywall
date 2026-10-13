import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'
import { offers } from '../utils/offers'
import { getDeviceId, isUUID } from '../utils/device'
import { savePurchase } from '../utils/purchases'

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw createError({ statusCode: 400, statusMessage: 'Invalid purchase request' })
  const { offerId, requestId } = body as Record<string, unknown>
  if (typeof offerId !== 'string' || !isUUID(requestId)) throw createError({ statusCode: 400, statusMessage: 'Invalid purchase request' })
  const offer = offers.find(item => item.id === offerId)
  if (!offer) throw createError({ statusCode: 400, statusMessage: 'Unknown offer' })
  const deviceId = getDeviceId(event)
  try {
    const result = savePurchase(deviceId, requestId.toLowerCase(), offer)
    setResponseStatus(event, result.created ? 201 : 200)
    return result.purchase
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409) throw error
    console.error('Purchase could not be committed', error)
    throw createError({ statusCode: 500, statusMessage: 'Purchase could not be saved' })
  }
})
