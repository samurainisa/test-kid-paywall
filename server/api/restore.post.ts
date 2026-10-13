import { createError, defineEventHandler } from 'h3'
import { getDeviceId } from '../utils/device'
import { restorePurchase } from '../utils/purchases'

export default defineEventHandler((event) => {
  const deviceId = getDeviceId(event)
  try {
    const purchase = restorePurchase(deviceId)
    return { found: purchase !== null, purchase }
  } catch (error) {
    console.error('Restore failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Restore unavailable' })
  }
})
