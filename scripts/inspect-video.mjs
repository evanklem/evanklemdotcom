import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
const lines = []
page.on('console', (msg) => {
  const t = msg.text()
  if (t.startsWith('[Video]')) lines.push(`${msg.type().toUpperCase()} ${t}`)
})
page.on('requestfailed', (req) => {
  if (req.url().endsWith('.mp4')) lines.push(`REQUEST FAILED: ${req.url()} ${req.failure()?.errorText}`)
})
page.on('response', (res) => {
  if (res.url().endsWith('.mp4')) lines.push(`MP4 RESPONSE: ${res.status()} ${res.url()}`)
})
await page.setViewport({ width: 1280, height: 800 })
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 4500))
const videoState = await page.evaluate(() => {
  const v = document.querySelector('video')
  if (!v) return { found: false }
  return {
    found: true,
    src: v.src,
    readyState: v.readyState,
    paused: v.paused,
    error: v.error?.message,
    videoWidth: v.videoWidth,
    videoHeight: v.videoHeight,
    currentTime: v.currentTime,
  }
})
console.log('=== video element state ===')
console.log(JSON.stringify(videoState, null, 2))
console.log('=== logs ===')
for (const l of lines) console.log(l)
await browser.close()
