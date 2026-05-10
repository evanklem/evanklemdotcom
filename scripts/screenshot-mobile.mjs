import puppeteer from 'puppeteer-core'

const URL = process.argv[2] ?? 'http://localhost:5173'
const OUT = process.argv[3] ?? '/tmp/surf-screenshots/mobile.png'
const WAIT_MS = Number(process.argv[4] ?? 4500)

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
// iPhone 14 Pro viewport
await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, WAIT_MS))
await page.screenshot({ path: OUT })
await browser.close()
console.log(`screenshot: ${OUT}`)
