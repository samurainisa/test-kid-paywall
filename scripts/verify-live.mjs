import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { chromium, request } from 'playwright'

const baseURL = process.argv[2]
if (!baseURL || new URL(baseURL).protocol !== 'https:') throw new Error('Usage: node scripts/verify-live.mjs https://your-service [--restore-only]')
const directory = resolve(import.meta.dirname, '../test-results/live')
await mkdir(directory, { recursive: true })
const restoreOnly = process.argv.includes('--restore-only')
const report = { baseURL, startedAt: new Date().toISOString(), checks: [], console: [], mobile: [] }
const keepAlive = setInterval(() => {}, 1000)
let api, browser, freshApi
function pass(text) { report.checks.push(text); console.log(`PASS ${text}`) }
async function ready(page) {
  await page.locator('[data-offer="yearly"]').waitFor()
  await page.evaluate(() => document.fonts.ready)
}
async function screenshot(page, name) {
  await page.evaluate(() => document.fonts.ready)
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  assert.equal(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true)
  await page.screenshot({ path: join(directory, `${name}.png`), animations: 'disabled' })
}
try {
  api = await request.newContext({ baseURL, storageState: restoreOnly ? join(directory, 'api-session.json') : undefined })
  assert.deepEqual(await (await api.get('/api/health')).json(), { status: 'ok', database: 'ok' })
  pass('Public HTTPS health and SQLite availability')
  if (restoreOnly) {
    const baseline = JSON.parse(await readFile(join(directory, 'baseline.json'), 'utf8'))
    assert.equal(baseline.baseURL, baseURL)
    const restored = await api.post('/api/restore')
    assert.equal(restored.status(), 200)
    assert.deepEqual(await restored.json(), { found: true, purchase: baseline.purchase })
    const repeat = await api.post('/api/purchase', { data: { offerId: baseline.purchase.offerId, requestId: baseline.requestId } })
    assert.equal(repeat.status(), 200)
    assert.deepEqual(await repeat.json(), baseline.purchase)
    pass('Saved cookie restores the identical baseline purchase; original key still returns 200')
  } else {
    const offersResponse = await api.get('/api/offers')
    assert.equal(offersResponse.status(), 200)
    const offers = (await offersResponse.json()).offers
    assert.deepEqual(offers.map(o => [o.id, o.priceMinor]), [['monthly', 29900], ['yearly', 199000]])
    const cookie = offersResponse.headers()['set-cookie']
    assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i); assert.match(cookie, /SameSite=Lax/i)
    pass('Real two-offer catalog, Secure HttpOnly SameSite=Lax cookie')
    for (const data of [{}, { offerId: 'bad', requestId: randomUUID() }, { offerId: 'yearly', requestId: 'bad' }]) {
      assert.equal((await api.post('/api/purchase', { data })).status(), 400)
    }
    assert.deepEqual(await (await api.post('/api/restore')).json(), { found: false, purchase: null })
    pass('Invalid requests return 400; no purchase appears on restore')
    const requestId = randomUUID()
    const body = { offerId: 'yearly', requestId }
    const responses = await Promise.all([api.post('/api/purchase', { data: body }), api.post('/api/purchase', { data: body })])
    assert.deepEqual(responses.map(r => r.status()).sort(), [200, 201])
    const purchase = await responses[0].json()
    assert.deepEqual(await responses[1].json(), purchase)
    assert.equal(purchase.offerId, 'yearly'); assert.equal(purchase.test, true)
    assert.ok(Number.isFinite(Date.parse(purchase.createdAt)))
    assert.equal((await api.post('/api/purchase', { data: { offerId: 'monthly', requestId } })).status(), 409)
    assert.deepEqual(await (await api.post('/api/restore')).json(), { found: true, purchase })
    await api.storageState({ path: join(directory, 'api-session.json') })
    await writeFile(join(directory, 'baseline.json'), JSON.stringify({ baseURL, requestId, purchase }, null, 2))
    pass('Real purchase 201, concurrent duplicate 200, same response, conflict 409, cookie restore')
    freshApi = await request.newContext({ baseURL })
    assert.deepEqual(await (await freshApi.post('/api/restore')).json(), { found: false, purchase: null })
    pass('Fresh device cannot restore another device purchase')
    for (const asset of ['hero.svg', 'close.svg', 'radio-selected.svg', 'radio-skeleton.svg', 'spinner.svg', 'success.svg']) {
      const assetResponse = await api.get(`/images/paywall/${asset}`)
      assert.equal(assetResponse.status(), 200); assert.ok((await assetResponse.body()).length > 0)
    }
    assert.equal((await api.get('/fonts/InterVariable.woff2')).status(), 200)
    pass('All six original SVG assets and local Inter font are served successfully')

    browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] })
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) report.console.push(message.text()) })
    let unlockOffers
    const offersGate = new Promise(r => { unlockOffers = r })
    await page.route('**/api/offers', async route => { await offersGate; await route.continue() })
    await page.goto(baseURL)
    await page.locator('.skeleton-card').first().waitFor()
    await screenshot(page, 'offers-loading')
    assert.equal(await page.locator('.primary-button').isDisabled(), true)
    unlockOffers(); await ready(page); await page.unroute('**/api/offers')
    await screenshot(page, 'normal')
    assert.equal(await page.locator('input[value="yearly"]').isChecked(), true)
    assert.equal((await page.locator('.primary-button').boundingBox()).y, 632)
    await page.locator('[data-offer="monthly"]').click()
    assert.equal(await page.locator('.primary-button').innerText(), 'Открыть за 299 ₽ в месяц')
    assert.equal(await page.locator('[data-offer="yearly"] .price').innerText(), '1 990 ₽')
    await page.locator('input[value="monthly"]').focus(); await page.keyboard.press('ArrowRight')
    assert.equal(await page.locator('input[value="yearly"]').isChecked(), true)
    await page.locator('input[value="yearly"]').blur()
    pass('Public UI: offers skeleton, annual default, month price, keyboard selection, CTA y=632')
    let unlockPurchase, purchaseEntered
    const purchaseGate = new Promise(r => { unlockPurchase = r })
    const entered = new Promise(r => { purchaseEntered = r })
    const bodies = []
    await page.route('**/api/purchase', async route => { bodies.push(route.request().postDataJSON()); purchaseEntered(); await purchaseGate; await route.abort('failed') })
    await page.locator('.primary-button').click(); await entered
    await screenshot(page, 'purchase-loading')
    for (const s of ['.primary-button', '.restore-button', '.close-button', 'input[value="monthly"]']) assert.equal(await page.locator(s).isDisabled(), true)
    unlockPurchase(); await page.getByRole('alert').waitFor()
    await screenshot(page, 'purchase-error')
    assert.equal(await page.locator('.primary-button').isEnabled(), true)
    await page.unroute('**/api/purchase')
    await page.route('**/api/purchase', async route => { bodies.push(route.request().postDataJSON()); await route.continue() })
    await page.locator('.primary-button').click()
    await page.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
    assert.equal(bodies[0].requestId, bodies[1].requestId)
    await screenshot(page, 'purchase-success')
    await page.getByRole('button', { name: 'Начать играть' }).click()
    await page.getByRole('heading', { name: 'Игра открыта' }).waitFor()
    await page.reload(); await page.getByRole('heading', { name: 'Игра открыта' }).waitFor()
    await page.goto(baseURL); await ready(page)
    await page.locator('.restore-button').click()
    await page.getByRole('heading', { name: 'Доступ открыт!' }).waitFor()
    await context.storageState({ path: join(directory, 'browser-session.json') })
    pass('Public UI: processing lock, network error recovery, same retry UUID, real success, game, reload and restore')
    const mobileContext = await browser.newContext({ deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
    const mobile = await mobileContext.newPage()
    for (const [width, height] of [[360, 800], [375, 812], [390, 844], [414, 896], [430, 932], [360, 640]]) {
      await mobile.setViewportSize({ width, height }); await mobile.goto(baseURL); await ready(mobile)
      const geometry = await mobile.evaluate(() => {
        const button = document.querySelector('.primary-button').getBoundingClientRect()
        return { overflow: document.documentElement.scrollWidth > innerWidth, buttonWidth: button.width, buttonY: button.y }
      })
      assert.equal(geometry.overflow, false); assert.equal(geometry.buttonWidth, width - 32)
      await mobile.locator('.restore-button').scrollIntoViewIfNeeded()
      await mobile.locator('.restore-button').click()
      await mobile.getByText('Покупок для этого устройства пока нет').waitFor()
      await mobile.screenshot({ path: join(directory, `mobile-${width}x${height}.png`), fullPage: true })
      report.mobile.push({ width, height, ...geometry })
    }
    pass('Public UI at six mobile sizes: no horizontal overflow, accessible restore, fresh-device message')
    assert.deepEqual(errors, [])
    assert.ok(!report.console.some(t => /hydrat|mismatch|failed to resolve/i.test(t)))
    pass('No uncaught browser errors or hydration warnings; expected network abort logged separately')
  }
  report.success = true
} catch (error) {
  report.success = false; report.failure = error.stack; console.error(error); process.exitCode = 1
} finally {
  await api?.dispose(); await freshApi?.dispose(); await browser?.close(); clearInterval(keepAlive)
  report.completedAt = new Date().toISOString()
  await writeFile(join(directory, restoreOnly ? 'restore-report.json' : 'report.json'), JSON.stringify(report, null, 2))
  console.log(`Live results: ${directory}`)
}
