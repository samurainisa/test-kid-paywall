import { defineEventHandler } from 'h3'
import { offers } from '../utils/offers'
import { getDeviceId } from '../utils/device'

export default defineEventHandler((event) => {
  getDeviceId(event)
  return { offers }
})
