import puppeteer from 'puppeteer-core'

const URL = process.argv[2] ?? 'http://localhost:5173'
const OUT = process.argv[3] ?? '/tmp/surf-screenshots/active.png'
const SECTION = process.argv[4] ?? 'ABOUT'
const WAIT_MS = Number(process.argv[5] ?? 5500)

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
})
await page.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 2500))
// Click the section chip with the matching label.
const clicked = await page.evaluate((sectionLabel) => {
  const buttons = Array.from(document.querySelectorAll('.vmenu__btn'))
  for (const b of buttons) {
    const lbl = b.querySelector('.vmenu__label')
    if (lbl && lbl.textContent.trim().toUpperCase() === sectionLabel) {
      b.click()
      return true
    }
  }
  return false
}, SECTION)
if (!clicked) console.log(`NOTE: chip not found for "${SECTION}"`)
await new Promise((r) => setTimeout(r, WAIT_MS))
await page.screenshot({ path: OUT })
await browser.close()
if (errors.length) {
  console.log('--- errors ---')
  for (const e of errors) console.log(e)
}
console.log(`screenshot: ${OUT}`)
