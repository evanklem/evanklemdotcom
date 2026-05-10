import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
})
const page = await browser.newPage()
const lines = []
page.on('console', (msg) => {
  const t = msg.text()
  if (t.includes('Vase') || t.startsWith('  ')) lines.push(t)
})
await page.setViewport({ width: 1280, height: 800 })
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 3500))
await browser.close()
for (const l of lines) console.log(l)
