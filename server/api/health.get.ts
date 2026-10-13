import { createError, defineEventHandler, setResponseHeader } from 'h3'
import { getDb } from '../utils/db'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  try {
    getDb().prepare('SELECT 1').get()
    return { status: 'ok', database: 'ok' }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Service unavailable' })
  }
})
