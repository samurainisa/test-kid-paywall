import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { request } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const image = process.env.TEST_DOCKER_IMAGE || 'test-kid-paywall:local'
const suffix = randomUUID().slice(0, 8)
const volume = `kid-paywall-test-${suffix}`
const container = `kid-paywall-test-${suffix}`
const port = Number(process.env.TEST_DOCKER_PORT || 3218)
const baseURL = `http://127.0.0.1:${port}`
const report = { image, volume, checks: [] }
// Containers are external processes; keep Node alive while a native fetch is pending.
const keepAlive = setInterval(() => {}, 1000)
function docker(...args) { return execFileSync('docker', args, { encoding: 'utf8', windowsHide: true }).trim() }
async function run() {
  docker('run', '-d', '--name', container, '-p', `127.0.0.1:${port}:3000`, '-v', `${volume}:/data`, image)
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${baseURL}/api/health`, { signal: AbortSignal.timeout(3000) })).ok) return } catch {}
    await delay(100)
  }
  throw new Error(`Container unhealthy: ${docker('logs', container)}`)
}
function rows() {
  return JSON.parse(docker('exec', container, 'node', '-e', "const D=require('./.output/server/node_modules/better-sqlite3'); const db=new D('/data/paywall.sqlite',{readonly:true}); console.log(JSON.stringify(db.prepare('SELECT * FROM purchases').all())); db.close()"))
}
let api
try {
  docker('volume', 'create', volume)
  await run()
  assert.equal(docker('exec', container, 'node', '--version'), 'v22.23.1')
  const bindings = docker('exec', container, 'find', '/app/.output/server/node_modules/better-sqlite3', '-name', '*.node')
  assert.match(bindings, /linux-x64\.node|better_sqlite3\.node/)
  report.checks.push('Linux production container, Node 22.23.1, native .node loads, health 200')
  api = await request.newContext({ baseURL })
  assert.equal((await (await api.get('/api/offers')).json()).offers.length, 2)
  const requestId = randomUUID()
  const response = await api.post('/api/purchase', { data: { offerId: 'yearly', requestId } })
  assert.equal(response.status(), 201)
  const purchase = await response.json()
  const stored = rows()
  assert.equal(stored.length, 1); assert.equal(stored[0].id, purchase.id)
  assert.equal(stored[0].price_minor, 199000); assert.equal(stored[0].request_id, requestId)
  report.checks.push('Real API purchase and direct SQLite row read inside container')
  docker('rm', '-f', container)
  await run() // A different container filesystem, the same attached named volume.
  assert.deepEqual(rows(), stored)
  assert.deepEqual(await (await api.post('/api/restore')).json(), { found: true, purchase })
  const duplicate = await api.post('/api/purchase', { data: { offerId: 'yearly', requestId } })
  assert.equal(duplicate.status(), 200); assert.deepEqual(await duplicate.json(), purchase)
  assert.equal(rows().length, 1)
  report.checks.push('Container recreated with same volume: identical persisted row, cookie restore and idempotency')
  report.success = true
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  report.success = false; report.failure = error.stack; process.exitCode = 1; console.error(error)
} finally {
  clearInterval(keepAlive)
  await api?.dispose()
  try { docker('rm', '-f', container) } catch {}
  // Retain only this isolated test volume as evidence; never touch working compose volumes.
  report.volumeRetained = true
  await mkdir(join(root, 'test-results'), { recursive: true })
  await writeFile(join(root, 'test-results/docker-report.json'), JSON.stringify(report, null, 2))
}
