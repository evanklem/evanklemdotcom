import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--autoplay-policy=no-user-gesture-required',
  ],
})
const page = await browser.newPage()
const lines = []
page.on('console', (msg) => {
  const t = msg.text()
  if (t.includes('[Vase]')) lines.push(`[${msg.type().toUpperCase()}] ${t}`)
})
await page.setViewport({ width: 1280, height: 800 })
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1500))
// Click the ABOUT chip.
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('.vmenu__btn'))
  for (const b of buttons) {
    const lbl = b.querySelector('.vmenu__label')
    if (lbl && lbl.textContent.trim() === 'ABOUT') {
      b.click()
      return
    }
  }
})
await new Promise((r) => setTimeout(r, 4000))
await browser.close()
for (const l of lines) console.log(l)
