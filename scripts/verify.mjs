import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, mkdir, cp, readFile, writeFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, request } from 'playwright'
import Database from 'better-sqlite3'
import sharp from 'sharp'
import { writeComparison } from './comparison.mjs'

const root = resolve(import.meta.dirname, '..')
const output = join(root, 'test-results')
await mkdir(output, { recursive: true })
const temp = await mkdtemp(join(tmpdir(), 'kid-paywall-'))
const sqlitePath = join(temp, 'data', 'test.sqlite')
const port = Number(process.env.TEST_PORT || 3217)
const baseURL = `http://127.0.0.1:${port}`
const report = { node: process.version, server: 'isolated production .output', database: sqlitePath, checks: [], visual: [], mobile: [], console: [] }
let server, browser, serverLog = ''

function passed(name) { report.checks.push(name); console.log(`PASS ${name}`) }
async function start(release) {
  const directory = join(temp, release)
  await mkdir(directory, { recursive: true })
  await cp(join(root, '.output'), join(directory, '.output'), { recursive: true })
  server = spawn(process.execPath, [join(directory, '.output/server/index.mjs')], {
    cwd: directory, windowsHide: true,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), NITRO_PORT: String(port), NITRO_HOST: '127.0.0.1', SQLITE_PATH: sqlitePath },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', chunk => { serverLog += chunk })
  server.stderr.on('data', chunk => { serverLog += chunk })
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(`Production server exited: ${serverLog}`)
    try { if ((await fetch(`${baseURL}/api/health`)).ok) return } catch {}
    await delay(100)
  }
  throw new Error(`Server did not start: ${serverLog}`)
}
async function stop() {
  if (!server || server.exitCode !== null) return
  const exited = once(server, 'exit')
  server.kill()
  await exited
}
function query(sql, ...params) {
  const db = new Database(sqlitePath, { readonly: true })
  try { return db.prepare(sql).all(...params) } finally { db.close() }
}
function rowCount() { return query('SELECT count(*) AS total FROM purchases')[0].total }
async function ready(page) {
  await page.locator('[data-offer="yearly"]').waitFor()
  await page.evaluate(() => document.fonts.ready)
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(output, `${name}.png`), animations: 'disabled' })
}
async function compare(name) {
  const refPath = join(root, 'reference', `${name}.png`)
  const actualPath = join(output, `${name}.png`)
  const { data: ref, info } = await sharp(refPath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const actual = await sharp(actualPath).removeAlpha().raw().toBuffer()
  assert.equal(actual.length, ref.length)
  const main = JSON.parse(await readFile(join(root, 'reference/main_metrics.json'), 'utf8'))
  const states = JSON.parse(await readFile(join(root, 'reference/states_metrics.json'), 'utf8'))
  const stateIds = { 'purchase-loading': '2:570', 'purchase-error': '2:618', 'purchase-success': '2:1279', 'offers-loading': '2:1309' }
  const mainTexts = main.filter(n => n.type === 'TEXT')
  const stateTexts = states.find(s => s.root === stateIds[name])?.nodes.filter(n => n.type === 'TEXT') || []
  const maskBoxes = [...mainTexts, ...stateTexts]
  // Separate typography rasterization from filled shapes/assets; keep full-image measurement too.
  const isText = (x, y) => maskBoxes.some(n => x >= n.x - 3 && x < n.x + n.w + 3 && y >= n.y - 3 && y < n.y + n.h + 3)
  const diff = Buffer.alloc(ref.length), overlay = Buffer.alloc(ref.length)
  let changed = 0, shapeChanged = 0, shapePixels = 0, totalError = 0
  for (let i = 0; i < ref.length; i += 3) {
    const index = i / 3, x = index % info.width, y = Math.floor(index / info.width)
    let max = 0
    for (let channel = 0; channel < 3; channel++) {
      const error = Math.abs(ref[i + channel] - actual[i + channel])
      max = Math.max(max, error); totalError += error
      overlay[i + channel] = Math.round((ref[i + channel] + actual[i + channel]) / 2)
    }
    const differs = max > 16
    if (differs) changed++
    if (!isText(x, y)) { shapePixels++; if (differs) shapeChanged++ }
    diff[i] = differs ? 225 : 247; diff[i + 1] = differs ? 30 : 247; diff[i + 2] = differs ? 90 : 255
  }
  await sharp(diff, { raw: { ...info, channels: 3 } }).png().toFile(join(output, `${name}-diff.png`))
  await sharp(overlay, { raw: { ...info, channels: 3 } }).png().toFile(join(output, `${name}-overlay.png`))
  const result = { name, thresholdPerChannel: 16, changedPercent: +(100 * changed / (info.width * info.height)).toFixed(3),
    nonTextChangedPercent: +(100 * shapeChanged / shapePixels).toFixed(3), meanAbsoluteChannelError: +(totalError / ref.length).toFixed(3) }
  report.visual.push(result)
  console.log('VISUAL', JSON.stringify(result))
  assert.ok(result.changedPercent < 5, `${name}: >5% full-image differences require review`)
  assert.ok(result.nonTextChangedPercent < 1, `${name}: >1% non-text differences require review`)
}

try {
  await start('release-1')
  passed('Standalone production server starts with traced native SQLite binding')
  const api = await request.newContext({ baseURL })
  const offersResponse = await api.get('/api/offers')
  assert.equal(offersResponse.status(), 200)
  const catalog = (await offersResponse.json()).offers
  assert.deepEqual(catalog.map(o => [o.id, o.priceMinor]), [['monthly', 29900], ['yearly', 199000]])
  const cookie = offersResponse.headers()['set-cookie']
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Lax/i)
  assert.match(cookie, /Path=\//); assert.doesNotMatch(cookie, /Secure/i)
  passed('Two real offers and valid HttpOnly device cookie')
  assert.equal(rowCount(), 0)
  const before = rowCount()
  for (const data of [null, [], {}, { offerId: 'bad', requestId: randomUUID() }, { offerId: 'yearly', requestId: 'bad' }]) {
    assert.equal((await api.post('/api/purchase', { data })).status(), 400)
  }
  assert.equal((await api.post('/api/purchase', { data: '{bad json', headers: { 'Content-Type': 'application/json' } })).status(), 400)
  assert.equal(rowCount(), before)
  passed('Invalid bodies/UUID/offer and malformed JSON do not insert rows')
  const requestId = randomUUID()
  const body = { offerId: 'yearly', requestId, priceMinor: 1, deviceId: randomUUID() }
  const concurrent = await Promise.all([api.post('/api/purchase', { data: body }), api.post('/api/purchase', { data: body })])
  assert.deepEqual(concurrent.map(r => r.status()).sort(), [200, 201])
  const purchase = await concurrent[0].json()
  assert.deepEqual(await concurrent[1].json(), purchase)
  const rows = query('SELECT * FROM purchases WHERE request_id = ?', requestId)
  assert.equal(rows.length, 1); assert.equal(rows[0].price_minor, 199000); assert.equal(rows[0].currency, 'RUB')
  assert.equal(rows[0].device_id, purchase.deviceId); assert.notEqual(purchase.deviceId, body.deviceId)
  assert.equal(rows[0].created_at, purchase.createdAt); assert.ok(Number.isFinite(Date.parse(purchase.createdAt)))
  assert.equal((await api.post('/api/purchase', { data: { offerId: 'monthly', requestId } })).status(), 409)
  assert.equal(rowCount(), 1)
  passed('Concurrent idempotency, conflict, server-owned price/device/date, direct SQLite row check')
  const restored = await api.post('/api/restore')
  assert.deepEqual(await restored.json(), { found: true, purchase })
  const stranger = await request.newContext({ baseURL })
  assert.deepEqual(await (await stranger.post('/api/restore')).json(), { found: false, purchase: null })
  const replaced = await stranger.get('/api/offers', { headers: { Cookie: 'paywall_device=invalid' } })
  assert.match(replaced.headers()['set-cookie'], /paywall_device=[0-9a-f-]{36}/)
  const secure = await stranger.get('/api/offers', { headers: { Cookie: 'paywall_device=invalid', 'X-Forwarded-Proto': 'https' } })
  assert.match(secure.headers()['set-cookie'], /Secure/i)
  passed('Restore uses cookie, fresh browser is isolated, invalid cookie replaced, HTTPS cookie Secure')

  browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const unexpected = []
  page.on('pageerror', error => unexpected.push(error.message))
  page.on('console', msg => { if (msg.type() === 'warning' || msg.type() === 'error') report.console.push(msg.text()) })
  await page.goto(baseURL)
  await ready(page)
  await shot(page, 'normal')
  const geometry = await page.evaluate(() => Object.fromEntries(['.close-panel', '.hero', '.description', '.offers', '.message-area', '.actions', '.disclaimer', '.primary-button'].map(s => {
    const r = document.querySelector(s).getBoundingClientRect(); return [s, { x: r.x, y: r.y, width: r.width, height: r.height }]
  })))
  report.geometry = geometry
  const expected = [[16, 16, 358, 44], [16, 60, 358, 144], [16, 204, 358, 148], [16, 352, 358, 208], [16, 560, 358, 72], [16, 632, 358, 108], [16, 740, 358, 88], [16, 632, 358, 56]]
  Object.values(geometry).forEach((r, i) => Object.values(r).forEach((v, j) => assert.ok(Math.abs(v - expected[i][j]) <= .01, `geometry ${i}/${j}: ${v} expected ${expected[i][j]}`)))
  passed('390×844: exact major block coordinates, sizes and button position')
  report.typography = await page.evaluate(() => Object.fromEntries(['.description h1', '.description p', '.price', '.caption', '.badge', '.restore-button', '.disclaimer p'].map(s => {
    const el = document.querySelector(s), r = el.getBoundingClientRect(), css = getComputedStyle(el)
    return [s, { x: r.x, y: r.y, width: r.width, height: r.height, font: css.fontFamily, size: css.fontSize, weight: css.fontWeight, lineHeight: css.lineHeight }]
  })))
  for (const [selector, expectedBox] of [['.badge', [274, 452, 84, 24]], ['[data-offer="yearly"] .indicator', [32, 500, 24, 24]]]) {
    const r = await page.locator(selector).boundingBox()
    Object.values(r).forEach((v, j) => assert.ok(Math.abs(v - expectedBox[j]) < .01))
  }
  await page.locator('[data-offer="monthly"]').click()
  assert.equal(await page.locator('.primary-button').innerText(), 'Открыть за 299 ₽ в месяц')
  assert.equal(await page.locator('[data-offer="yearly"] .price').innerText(), '1 990 ₽')
  assert.equal(await page.locator('[data-offer="yearly"] .badge').innerText(), 'Выгоднее')
  await page.locator('input[value="monthly"]').focus()
  await page.keyboard.press('ArrowRight')
  assert.equal(await page.locator('input[value="yearly"]').isChecked(), true)
  await page.locator('input[value="yearly"]').blur()
  passed('Month selection, unchanged annual data/badge, native radio keyboard navigation')

  let releasePurchase, purchaseEntered
  const purchaseGate = new Promise(r => { releasePurchase = r })
  const entered = new Promise(r => { purchaseEntered = r })
  const sentBodies = []
  await page.route('**/api/purchase', async route => {
    sentBodies.push(route.request().postDataJSON()); purchaseEntered(); await purchaseGate; await route.abort('failed')
  })
  await page.locator('.primary-button').click()
  await entered
  await shot(page, 'purchase-loading')
  for (const selector of ['.primary-button', '.restore-button', '.close-button', 'input[value="monthly"]']) assert.equal(await page.locator(selector).isDisabled(), true)
  releasePurchase()
  await page.getByRole('alert').waitFor()
  await shot(page, 'purchase-error')
  assert.equal(await page.locator('.primary-button').isEnabled(), true)
  assert.equal(await page.locator('input[value="yearly"]').isChecked(), true)
  await page.unroute('**/api/purchase')
  await page.route('**/api/purchase', async route => { sentBodies.push(route.request().postDataJSON()); await route.continue() })
  await page.locator('.primary-button').click()
  await page.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
  assert.equal(sentBodies[0].requestId, sentBodies[1].requestId)
  assert.equal(query('SELECT * FROM purchases WHERE request_id = ?', sentBodies[1].requestId).length, 1)
  await shot(page, 'purchase-success')
  const successIcon = await page.locator('.success-heading img').boundingBox()
  assert.deepEqual(successIcon, { x: 56.5, y: 252, width: 40, height: 40 })
  assert.equal((await page.locator('.primary-button').boundingBox()).y, 632)
  assert.equal(await page.locator('[data-offer]').count(), 0)
  await page.getByRole('button', { name: 'Начать играть' }).click()
  await page.getByRole('heading', { name: 'Игра открыта' }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Игра открыта' }).waitFor()
  passed('Network error unlocks UI; retry keeps request UUID; real commit shows success; game reload restores')

  const freshContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const fresh = await freshContext.newPage()
  let releaseOffers, offersEntered
  const offersGate = new Promise(r => { releaseOffers = r })
  const offersEnteredPromise = new Promise(r => { offersEntered = r })
  await fresh.route('**/api/offers', async route => { offersEntered(); await offersGate; await route.continue() })
  await fresh.goto(baseURL)
  await offersEnteredPromise
  await fresh.locator('.skeleton-card').first().waitFor()
  await shot(fresh, 'offers-loading')
  assert.equal(await fresh.locator('.primary-button').isDisabled(), true)
  releaseOffers()
  await ready(fresh)
  await fresh.unroute('**/api/offers')
  await fresh.locator('.restore-button').click()
  await fresh.getByRole('status').filter({ hasText: 'Покупок для этого устройства пока нет' }).waitFor()
  assert.equal(await fresh.locator('input[value="yearly"]').isChecked(), true)
  passed('Offers skeleton while network held; empty restore keeps selection')

  await fresh.route('**/api/offers', route => route.fulfill({ status: 503, body: '{}' }))
  await fresh.reload()
  await fresh.getByRole('button', { name: 'Повторить загрузку' }).waitFor()
  assert.equal(await fresh.locator('[data-offer]').count(), 0)
  await fresh.unroute('**/api/offers')
  await fresh.getByRole('button', { name: 'Повторить загрузку' }).click()
  await ready(fresh)
  passed('GET failure has explicit retry and no fake offers')
  await fresh.locator('[data-offer="monthly"]').click()
  await fresh.route('**/api/restore', route => route.abort('failed'))
  await fresh.locator('.restore-button').click()
  await fresh.getByRole('alert').waitFor()
  assert.equal(await fresh.locator('input[value="monthly"]').isChecked(), true)
  assert.equal(await fresh.locator('.restore-button').isEnabled(), true)
  await fresh.unroute('**/api/restore')
  await fresh.locator('[data-offer="yearly"]').click()
  passed('Restore network failure retains monthly selection and unlocks actions')

  // Inject a real database write failure, outside production routes; COMMIT must never be faked.
  const db = new Database(sqlitePath)
  db.exec("CREATE TRIGGER test_reject_purchase BEFORE INSERT ON purchases BEGIN SELECT RAISE(ABORT, 'test write failure'); END")
  db.close()
  const countBeforeFailure = rowCount()
  await fresh.locator('.primary-button').click()
  await fresh.getByRole('alert').waitFor()
  assert.equal(await fresh.getByRole('heading', { name: 'Доступ открыт!' }).count(), 0)
  assert.equal(rowCount(), countBeforeFailure)
  assert.equal(await fresh.locator('.primary-button').isEnabled(), true)
  const writable = new Database(sqlitePath); writable.exec('DROP TRIGGER test_reject_purchase'); writable.close()
  await fresh.locator('[data-offer="monthly"]').click()
  await fresh.locator('.primary-button').click()
  await fresh.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
  passed('Actual SQLite INSERT failure cannot display success; new month operation succeeds after failure')

  const mobileContext = await browser.newContext({ deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const mobile = await mobileContext.newPage()
  for (const [width, height] of [[360, 800], [375, 812], [390, 844], [414, 896], [430, 932], [360, 640], [320, 640]]) {
    await mobile.setViewportSize({ width, height })
    await mobile.goto(baseURL); await ready(mobile)
    const layout = await mobile.evaluate(() => {
      const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom } }
      return { horizontalOverflow: document.documentElement.scrollWidth > innerWidth, offers: box('.offers'), message: box('.message-area'), button: box('.primary-button'), close: box('.close-button'), restore: box('.restore-button'), footer: box('.disclaimer'), hero: box('.hero img') }
    })
    assert.equal(layout.horizontalOverflow, false)
    assert.ok(layout.offers.bottom <= layout.message.y && layout.message.bottom <= layout.button.y)
    assert.equal(layout.hero.width, 358); assert.equal(layout.hero.height, 144)
    assert.equal(layout.button.width, width - 32); assert.equal(layout.close.height, 44); assert.equal(layout.restore.height, 44)
    await mobile.locator('.restore-button').scrollIntoViewIfNeeded()
    await mobile.locator('.restore-button').click()
    await mobile.getByText('Покупок для этого устройства пока нет').waitFor()
    await mobile.screenshot({ path: join(output, `mobile-${width}x${height}.png`), fullPage: true })
    report.mobile.push({ width, height, ...layout })
    await mobile.route('**/api/purchase', route => route.abort('failed'))
    await mobile.locator('.primary-button').click()
    await mobile.getByRole('alert').waitFor()
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    const errorBox = await mobile.locator('.inline-message').boundingBox()
    const buttonBox = await mobile.locator('.primary-button').boundingBox()
    assert.ok(errorBox.y + errorBox.height <= buttonBox.y)
    await mobile.unroute('**/api/purchase')
    // Real success on each viewport, with accessible lower action and a readable message.
    await mobile.locator('.primary-button').click()
    await mobile.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await mobile.locator('.primary-button').scrollIntoViewIfNeeded()
    await mobile.screenshot({ path: join(output, `mobile-success-${width}x${height}.png`), fullPage: true })
    await mobile.locator('.primary-button').click()
    await mobile.getByRole('heading', { name: 'Игра открыта' }).waitFor()
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await mobileContext.clearCookies()
  }
  passed('7 mobile sizes incl. 360×640 and 320×640: no horizontal scroll/overlap, real success and accessible actions')

  const lossContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const loss = await lossContext.newPage()
  await loss.goto(baseURL); await ready(loss)
  const lostKeys = []
  await loss.route('**/api/purchase', async route => {
    lostKeys.push(route.request().postDataJSON().requestId)
    const committed = await route.fetch()
    assert.equal(committed.status(), 201)
    await route.abort('failed')
  })
  await loss.locator('.primary-button').click()
  await loss.getByRole('alert').waitFor()
  assert.equal(query('SELECT * FROM purchases WHERE request_id = ?', lostKeys[0]).length, 1)
  await loss.unroute('**/api/purchase')
  await loss.route('**/api/purchase', async route => {
    lostKeys.push(route.request().postDataJSON().requestId)
    const repeated = await route.fetch(); assert.equal(repeated.status(), 200)
    await route.fulfill({ response: repeated })
  })
  await loss.locator('.primary-button').click()
  await loss.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
  assert.equal(lostKeys[0], lostKeys[1])
  assert.equal(query('SELECT * FROM purchases WHERE request_id = ?', lostKeys[0]).length, 1)
  passed('Response lost after actual COMMIT: UI retry uses original UUID and returns existing row (200)')

  await mobile.setViewportSize({ width: 360, height: 640 })
  await mobile.goto(baseURL); await ready(mobile)
  await mobile.evaluate(() => {
    const styles = [...document.querySelectorAll('h1, p, .offer-title, .price, .caption, .badge, button span, .restore-button')].map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize), line: parseFloat(getComputedStyle(el).lineHeight) }))
    for (const { el, size, line } of styles) { el.style.fontSize = `${size * 2}px`; el.style.lineHeight = `${line * 2}px` }
  })
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  const enlargedOffers = await mobile.locator('.offers').boundingBox()
  const enlargedDescription = await mobile.locator('.description').boundingBox()
  assert.ok(enlargedDescription.y + enlargedDescription.height <= enlargedOffers.y)
  await mobile.locator('.restore-button').scrollIntoViewIfNeeded()
  await mobile.screenshot({ path: join(output, 'mobile-large-text.png'), fullPage: true })
  passed('200% text stress test at 360×640 grows vertically without horizontal overflow or clipped actions')

  const closedContext = await browser.newContext()
  const closed = await closedContext.newPage()
  await closed.goto(baseURL); await ready(closed)
  await closed.getByRole('button', { name: 'Закрыть экран покупки' }).click()
  await closed.getByRole('heading', { name: 'Доступ не открыт' }).waitFor()
  await closed.getByRole('link', { name: 'Открыть экран покупки' }).click()
  await ready(closed)
  passed('Close opens safe /game fallback, unpaid game returns to paywall')
  assert.deepEqual(unexpected, [])
  assert.ok(!report.console.some(m => /hydrat|mismatch|failed to resolve component/i.test(m)))
  const chunks = await readdir(join(root, '.output/public/_nuxt'))
  for (const file of chunks.filter(f => f.endsWith('.js'))) assert.doesNotMatch(await readFile(join(root, '.output/public/_nuxt', file), 'utf8'), /better-sqlite3|CREATE TABLE|SQLITE_PATH/)
  passed('No uncaught JS errors/hydration warnings; SQLite code absent from client bundle')
  for (const asset of ['hero.svg', 'close.svg', 'radio-selected.svg', 'radio-skeleton.svg', 'spinner.svg', 'success.svg']) {
    assert.deepEqual(await readFile(join(root, 'assets', asset)), await readFile(join(root, 'public/images/paywall', asset)))
  }
  assert.deepEqual(await readFile(join(root, 'assets/InterVariable.woff2')), await readFile(join(root, 'public/fonts/InterVariable.woff2')))
  passed('All SVGs and local Inter font are byte-identical to supplied assets')

  await stop()
  const rowsBeforeRestart = rowCount()
  await start('release-2')
  assert.equal(rowCount(), rowsBeforeRestart)
  assert.deepEqual(await (await api.post('/api/restore')).json(), { found: true, purchase })
  await page.goto(baseURL); await ready(page)
  await page.locator('.restore-button').click()
  await page.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
  passed('New process and new isolated release directory preserve SQLite rows and cookie restore')
  for (const state of ['normal', 'offers-loading', 'purchase-loading', 'purchase-error', 'purchase-success']) await compare(state)
  passed('All five reference screenshots compared using overlays and thresholded RGB diffs')
  report.success = true
  await api.dispose(); await stranger.dispose()
} catch (error) {
  report.success = false; report.failure = error.stack
  console.error(error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await stop()
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
  if (report.visual.length) await writeComparison(output)
  await writeFile(join(output, 'server.log'), serverLog)
  console.log(`Results: ${output}; isolated test data retained at ${temp}`)
}
