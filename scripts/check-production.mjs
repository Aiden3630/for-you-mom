import { chromium } from 'playwright'
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
/* global document */

const output = resolve('output/playwright')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const processes = []
const report = { production: [], qr: {}, print: {} }

async function startServer(directory, port, base = '/') {
  const child = spawn(process.execPath, ['scripts/serve.mjs', directory], {
    env: { ...process.env, PORT: String(port), SERVE_BASE: base },
    stdio: 'ignore',
    windowsHide: true,
  })
  processes.push(child)
  const url = `http://127.0.0.1:${port}${base}`
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).ok) return url
    } catch {
      /* Сервер запускается. */
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Сервер не запустился: ${url}`)
}

async function smokeSite(url) {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  const errors = []
  const external = []
  const requests = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`)
  })
  await context.route('**/*', (route) => {
    const request = route.request()
    if (/^https?:/.test(request.url()) && new URL(request.url()).hostname !== '127.0.0.1') {
      external.push(request.url())
      return route.abort()
    }
    requests.push(request.url())
    return route.continue()
  })
  await page.goto(url)
  await page.locator('#chapter-heading').waitFor()
  await page.evaluate(() => document.fonts.ready)
  assert.equal(
    requests.some((r) => /\.(wav|mp3)(\?|$)/.test(r)),
    false,
    'Музыка не должна грузиться до согласия',
  )
  for (let i = 0; i < 7; i++) {
    await page.locator('.chapter-nav button').nth(i).click()
    await page.locator('#chapter-heading').waitFor()
    assert.equal(await page.locator('section.chapter').count(), 1)
  }
  await page.getByRole('button', { name: 'Музыка', exact: true }).click()
  await page.getByRole('button', { name: 'Включить музыку', exact: true }).click()
  await page.getByRole('button', { name: 'Выключить музыку', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Закрыть настройки' }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Сохранить открытку', exact: true }).click()
  await (
    await download
  ).saveAs(
    resolve(
      output,
      url.includes('/mom_day/') ? 'production-base-final.png' : 'production-final.png',
    ),
  )
  const audio = await fetch(new URL('music/amberlight.mp3', url), {
    headers: { Range: 'bytes=0-100' },
  })
  assert.equal(audio.status, 206)
  assert.equal((await audio.arrayBuffer()).byteLength, 101)
  const firstByte = await fetch(new URL('music/amberlight.mp3', url), {
    headers: { Range: 'bytes=0-0' },
  })
  assert.equal(firstByte.status, 206)
  assert.equal((await firstByte.arrayBuffer()).byteLength, 1)
  assert.deepEqual(errors, [])
  assert.deepEqual(external, [])
  report.production.push({
    url,
    chapters: 7,
    runtimeErrors: errors,
    externalRequests: external,
    png: true,
    audioRange: true,
  })
  await context.close()
}

try {
  await smokeSite(await startServer('dist', 4173))
  const build = spawnSync(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'build', '--base', '/mom_day/', '--outDir', 'dist-base'],
    { encoding: 'utf8', windowsHide: true },
  )
  assert.equal(build.status, 0, build.stderr)
  await smokeSite(await startServer('dist-base', 4174, '/mom_day/'))

  const qrDir = resolve(output, 'qr-check')
  await mkdir(qrDir, { recursive: true })
  const qr = spawnSync(
    process.execPath,
    [resolve('scripts/generate-qr.mjs'), 'https://example.org/gift/?test=1'],
    { cwd: qrDir, encoding: 'utf8', windowsHide: true },
  )
  assert.equal(qr.status, 0, qr.stderr)
  const png = await readFile(resolve(qrDir, 'delivery/qr.png'))
  assert.equal(png.subarray(1, 4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), 1000)
  const svg = await readFile(resolve(qrDir, 'delivery/qr.svg'), 'utf8')
  assert.match(svg, /<svg/)
  assert.equal(
    await readFile(resolve(qrDir, 'delivery/final-url.txt'), 'utf8'),
    'https://example.org/gift/?test=1\n',
  )
  const invalid = spawnSync(
    process.execPath,
    [resolve('scripts/generate-qr.mjs'), 'javascript:alert(1)'],
    { encoding: 'utf8', windowsHide: true },
  )
  assert.equal(invalid.status, 1)
  report.qr = {
    pngSize: 1000,
    svg: true,
    correctAddress: true,
    invalidAddressRejected: true,
    testOnlyAddress: true,
  }

  const page = await browser.newPage({ viewport: { width: 700, height: 1000 } })
  await page.goto(pathToFileURL(resolve('delivery/card.html')).href)
  await page.evaluate(() => document.fonts.ready)
  assert.ok((await page.locator('.card').innerText()).includes('Мам, я кое-что'))
  await page.locator('.card').screenshot({ path: resolve(output, 'card-a6.png') })
  await page.pdf({ path: 'delivery/card-a6.pdf', preferCSSPageSize: true, printBackground: true })
  const pdf = await readFile('delivery/card-a6.pdf')
  const raw = pdf.toString('latin1')
  assert.equal((raw.match(/\/Type\s*\/Page\b/g) || []).length, 1)
  const box = /\/MediaBox\s*\[([^\]]+)\]/.exec(raw)?.[1]
  assert.ok(box)
  const dimensions = box.split(/\s+/).map(Number)
  assert.ok(Math.abs(dimensions[2] - (105 / 25.4) * 72) < 2)
  assert.ok(Math.abs(dimensions[3] - (148 / 25.4) * 72) < 2)
  report.print = { pdfPages: 1, format: 'A6', mediaBox: box, bytes: pdf.length, noFinalQrYet: true }
  console.log(JSON.stringify(report, null, 2))
  await writeFile(resolve(output, 'production-checks.json'), JSON.stringify(report, null, 2))
} finally {
  await browser.close()
  for (const child of processes) child.kill()
}
