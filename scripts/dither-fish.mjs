import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { PNG } from 'pngjs'

// Generates dithered goldfish sprites for the aquarium section.
// Run: node scripts/dither-fish.mjs
//
// Synthesizes a stylized goldfish silhouette (head-right) and applies
// Bayer 4x4 ordered dither over a transparent background. To swap in a
// real photo source later, replace renderSourceTone() to read pixels
// from a PNG via PNG.sync.read().

const W = 96
const H = 56

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

// Returns a tone value in [0, 1] per pixel where >0 marks "inside the fish".
// Higher = denser dither (more solid). Outside of body/tail/fins is 0.
function renderSourceTone() {
  const tone = Array.from({ length: H }, () => new Array(W).fill(0))

  const cx = W * 0.55
  const cy = H * 0.5
  const bodyA = W * 0.3
  const bodyB = H * 0.3

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const dx = (x - cx) / bodyA
      const dy = (y - cy) / bodyB
      const r2 = dx * dx + dy * dy
      const inBody = r2 < 1

      // Tail: triangle on the left of body (x in [tailWide, tailApex]).
      let inTail = false
      const tailWideX = W * 0.05
      const tailApexX = W * 0.27
      if (x >= tailWideX && x <= tailApexX) {
        const t = (x - tailWideX) / (tailApexX - tailWideX)
        const tailHalf = (H * 0.45) * (1 - t) + (H * 0.04) * t
        if (Math.abs(y - cy) < tailHalf) inTail = true
      }

      // Dorsal fin: arc on top of body
      let inDorsal = false
      const dorsalCx = W * 0.5
      const dorsalRx = W * 0.14
      if (x >= dorsalCx - dorsalRx && x <= dorsalCx + dorsalRx) {
        const t = (x - (dorsalCx - dorsalRx)) / (2 * dorsalRx)
        const finHeight = Math.sin(Math.PI * t) * (H * 0.20)
        const yMin = cy - bodyB - finHeight
        if (y >= yMin && y <= cy - bodyB + 1) inDorsal = true
      }

      // Pelvic fin: smaller bump under belly
      let inPelvic = false
      const pelvicCx = W * 0.6
      const pelvicRx = W * 0.07
      if (x >= pelvicCx - pelvicRx && x <= pelvicCx + pelvicRx) {
        const t = (x - (pelvicCx - pelvicRx)) / (2 * pelvicRx)
        const finHeight = Math.sin(Math.PI * t) * (H * 0.10)
        const yMax = cy + bodyB + finHeight
        if (y >= cy + bodyB - 1 && y <= yMax) inPelvic = true
      }

      if (inBody) {
        // Tone: brighter on top (back), denser on belly. Higher tone = more
        // pixels survive the Bayer threshold, so the belly reads as more solid.
        const radial = 1 - Math.sqrt(Math.max(0, Math.min(1, r2)))
        const verticalShade = ((y - cy) / bodyB) * 0.16
        tone[y][x] = Math.max(0, Math.min(1, 0.55 + radial * 0.35 + verticalShade))
      } else if (inTail) {
        tone[y][x] = 0.55
      } else if (inDorsal || inPelvic) {
        tone[y][x] = 0.6
      }
    }
  }

  // Eye: punch out a single transparent pixel near the head
  const eyeX = Math.round(W * 0.78)
  const eyeY = Math.round(H * 0.46)
  if (eyeY >= 0 && eyeY < H && eyeX >= 0 && eyeX < W) tone[eyeY][eyeX] = 0

  return tone
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function ditherWithColor(tone, hex) {
  const png = new PNG({ width: W, height: H })
  const [r, g, b] = hexToRgb(hex)
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const idx = (y * W + x) << 2
      const t = tone[y][x]
      if (t <= 0) {
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
        png.data[idx + 3] = 0
        continue
      }
      const threshold = (bayer4[y % 4][x % 4] + 0.5) / 16
      const on = t > threshold
      png.data[idx] = on ? r : 0
      png.data[idx + 1] = on ? g : 0
      png.data[idx + 2] = on ? b : 0
      png.data[idx + 3] = on ? 255 : 0
    }
  }
  return PNG.sync.write(png)
}

const PALETTE = [
  { id: 'orange', hex: '#ff8a3d' },
  { id: 'lemon', hex: '#ffd84d' },
  { id: 'red', hex: '#d63a2c' },
  { id: 'pearl', hex: '#f5f5f5' },
]

const outDir = join(process.cwd(), 'public/textures/aquarium/fish')
mkdirSync(outDir, { recursive: true })
const tone = renderSourceTone()
for (const { id, hex } of PALETTE) {
  const buf = ditherWithColor(tone, hex)
  const path = join(outDir, `${id}.png`)
  writeFileSync(path, buf)
  console.log(`wrote ${path}`)
}
