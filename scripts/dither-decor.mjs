import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { PNG } from 'pngjs'

// Generates dithered decor sprites for the aquarium section.
// Each decor item is drawn as a procedural tone field, then Bayer-dithered
// onto a transparent background using the item's accent color.
//
// Run: node scripts/dither-decor.mjs

const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function ditherSprite(tone, w, h, hex) {
  const png = new PNG({ width: w, height: h })
  const [r, g, b] = hexToRgb(hex)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) << 2
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

function emptyTone(w, h) {
  return Array.from({ length: h }, () => new Array(w).fill(0))
}

// Each decor is (w, h, color, draw(tone, w, h) → tone). Tones are densities
// in [0..1]; higher reads as more solid after Bayer dithering.

function castle(tone, w, h) {
  // Square base + 3 crenellated towers + arch door.
  const baseTop = Math.round(h * 0.55)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (y >= baseTop && y < h - 2) tone[y][x] = 0.85
    }
  }
  const towers = [
    { cx: w * 0.18, top: h * 0.2, width: w * 0.22 },
    { cx: w * 0.5, top: h * 0.08, width: w * 0.22 },
    { cx: w * 0.82, top: h * 0.2, width: w * 0.22 },
  ]
  for (const t of towers) {
    const x0 = Math.round(t.cx - t.width / 2)
    const x1 = Math.round(t.cx + t.width / 2)
    for (let y = Math.round(t.top); y < baseTop; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        if (y >= 0 && x >= 0 && x < w) tone[y][x] = 0.85
      }
    }
    // Crenellations (notches at top)
    const notchY0 = Math.round(t.top)
    const notchY1 = Math.round(t.top + Math.max(2, h * 0.05))
    const notchEvery = Math.max(2, Math.round(t.width / 3.2))
    for (let x = x0; x < x1; x += 1) {
      const phase = ((x - x0) % notchEvery) < notchEvery / 2
      if (phase) {
        for (let y = notchY0; y < notchY1; y += 1) {
          if (y >= 0 && x >= 0 && x < w) tone[y][x] = 0
        }
      }
    }
  }
  // Arch door
  const doorCx = w * 0.5
  const doorR = w * 0.08
  for (let y = baseTop; y < h - 2; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (x - doorCx) / doorR
      const dy = Math.max(0, (y - (baseTop + doorR * 0.6)) / doorR)
      if (dx * dx + dy * dy < 1 && y < h - 4 && y >= 0 && y < tone.length) tone[y][x] = 0
    }
  }
  return tone
}

function plantTall(tone, w, h) {
  // Three vertical wavy ribbons.
  const ribbons = [w * 0.25, w * 0.5, w * 0.75]
  for (const cx of ribbons) {
    for (let yy = Math.round(h * 0.05); yy < h - 2; yy += 1) {
      const wave = Math.sin((yy / h) * Math.PI * 3 + cx) * (w * 0.04)
      const x0 = Math.round(cx + wave - w * 0.04)
      const x1 = Math.round(cx + wave + w * 0.04)
      for (let x = x0; x < x1; x += 1) {
        if (x >= 0 && x < w) tone[yy][x] = 0.9
      }
    }
  }
  return tone
}

function plantBushy(tone, w, h) {
  // Cluster of overlapping circles forming a bush silhouette.
  const blobs = [
    { cx: w * 0.5, cy: h * 0.55, r: w * 0.32 },
    { cx: w * 0.32, cy: h * 0.62, r: w * 0.22 },
    { cx: w * 0.7, cy: h * 0.62, r: w * 0.22 },
    { cx: w * 0.5, cy: h * 0.35, r: w * 0.2 },
  ]
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let inside = false
      for (const b of blobs) {
        const dx = x - b.cx
        const dy = y - b.cy
        if (dx * dx + dy * dy < b.r * b.r) {
          inside = true
          break
        }
      }
      if (inside) tone[y][x] = 0.85
    }
  }
  return tone
}

function rockSmooth(tone, w, h, scale) {
  // Squat ellipse with a flat-ish top.
  const cx = w * 0.5
  const cy = h * (0.55 + scale * 0.05)
  const a = w * 0.42
  const b = h * (0.4 + scale * 0.05)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (x - cx) / a
      const dy = (y - cy) / b
      if (dx * dx + dy * dy < 1) tone[y][x] = 0.78 + (Math.random() < 0.06 ? 0.15 : 0)
    }
  }
  return tone
}

function bubbler(tone, w, h) {
  // Vertical tube with rising bubble specks.
  const tubeX0 = Math.round(w * 0.42)
  const tubeX1 = Math.round(w * 0.58)
  for (let yy = Math.round(h * 0.35); yy < h - 2; yy += 1) {
    for (let x = tubeX0; x < tubeX1; x += 1) {
      tone[yy][x] = 0.7
    }
  }
  // Cap
  for (let yy = h - 5; yy < h - 2; yy += 1) {
    for (let x = Math.round(w * 0.32); x < Math.round(w * 0.68); x += 1) {
      if (yy >= 0 && yy < h && x >= 0 && x < w) tone[yy][x] = 0.85
    }
  }
  // Bubbles rising
  const bubbles = [
    { cx: w * 0.5, cy: h * 0.3, r: w * 0.08 },
    { cx: w * 0.42, cy: h * 0.18, r: w * 0.06 },
    { cx: w * 0.58, cy: h * 0.1, r: w * 0.05 },
    { cx: w * 0.5, cy: h * 0.02, r: w * 0.04 },
  ]
  for (const b of bubbles) {
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const dx = x - b.cx
        const dy = y - b.cy
        const d2 = dx * dx + dy * dy
        if (d2 < b.r * b.r && d2 > (b.r * 0.6) * (b.r * 0.6)) tone[y][x] = 0.7
      }
    }
  }
  return tone
}

function chest(tone, w, h) {
  // Rectangular base + curved lid + lock.
  const lidH = Math.round(h * 0.35)
  const baseTop = lidH
  for (let yy = baseTop; yy < h - 2; yy += 1) {
    for (let x = Math.round(w * 0.08); x < Math.round(w * 0.92); x += 1) {
      tone[yy][x] = 0.85
    }
  }
  // Lid: dome
  const lidCx = w * 0.5
  const lidA = w * 0.42
  const lidB = lidH
  for (let y = 0; y < lidH; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = (x - lidCx) / lidA
      const dy = (y - lidH) / lidB
      if (dx * dx + dy * dy < 1) tone[y][x] = 0.85
    }
  }
  // Strap (band across)
  for (let yy = lidH - 1; yy <= lidH + 1; yy += 1) {
    for (let x = Math.round(w * 0.08); x < Math.round(w * 0.92); x += 1) {
      if (yy >= 0 && yy < h) tone[yy][x] = 0
    }
  }
  // Lock keyhole (small bright square)
  const lockX = Math.round(w * 0.48)
  const lockY = Math.round(h * 0.62)
  for (let y = lockY; y < lockY + 4; y += 1) {
    for (let x = lockX; x < lockX + 4; x += 1) {
      if (y >= 0 && y < h && x >= 0 && x < w) tone[y][x] = 0
    }
  }
  return tone
}

function driftwood(tone, w, h) {
  // Horizontal twisted log: two overlapping ovals with knot voids.
  const cy = h * 0.5
  const segments = [
    { cx: w * 0.25, cy: cy - h * 0.05, a: w * 0.28, b: h * 0.22 },
    { cx: w * 0.55, cy: cy + h * 0.06, a: w * 0.32, b: h * 0.2 },
    { cx: w * 0.85, cy: cy - h * 0.04, a: w * 0.16, b: h * 0.16 },
  ]
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      for (const s of segments) {
        const dx = (x - s.cx) / s.a
        const dy = (y - s.cy) / s.b
        if (dx * dx + dy * dy < 1) tone[y][x] = 0.82
      }
    }
  }
  // Knot
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - w * 0.45
      const dy = y - cy
      if (dx * dx + dy * dy < (h * 0.08) * (h * 0.08)) tone[y][x] = 0
    }
  }
  return tone
}

const DECOR = [
  { id: 'castle', w: 80, h: 64, color: '#8a8a8a', draw: castle },
  { id: 'plant-tall', w: 56, h: 80, color: '#3da66e', draw: plantTall },
  { id: 'plant-bushy', w: 64, h: 56, color: '#2f8a5a', draw: plantBushy },
  { id: 'rock-small', w: 48, h: 32, color: '#6b6b6b', draw: (t, w, h) => rockSmooth(t, w, h, 0) },
  { id: 'rock-large', w: 72, h: 48, color: '#5a5a5a', draw: (t, w, h) => rockSmooth(t, w, h, 1) },
  { id: 'bubbler', w: 40, h: 96, color: '#cfd8dc', draw: bubbler },
  { id: 'chest', w: 64, h: 48, color: '#a06a3a', draw: chest },
  { id: 'driftwood', w: 96, h: 40, color: '#7a4a2a', draw: driftwood },
]

const outDir = join(process.cwd(), 'public/textures/aquarium/decor')
mkdirSync(outDir, { recursive: true })
for (const d of DECOR) {
  const tone = emptyTone(d.w, d.h)
  d.draw(tone, d.w, d.h)
  const buf = ditherSprite(tone, d.w, d.h, d.color)
  const path = join(outDir, `${d.id}.png`)
  writeFileSync(path, buf)
  console.log(`wrote ${path} (${d.w}x${d.h})`)
}
