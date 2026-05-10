import { readFileSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'

const inputPath = 'public/evanklemdotcomlogo.png'
const outputPath = 'public/evanklemdotcomlogo-dither-2x.png'
const maskOutputPath = 'public/evanklemdotcomlogo-dither-depth-mask-2x.png'
const scale = 2

const bayer8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
]

function quantize(value, x, y, levels) {
  const normalized = value / 255
  const scaled = normalized * (levels - 1)
  const base = Math.floor(scaled)
  const fraction = scaled - base
  const threshold = (bayer8[y % 8][x % 8] + 0.5) / 64
  return Math.min(levels - 1, base + (fraction > threshold ? 1 : 0)) * (255 / (levels - 1))
}

const source = PNG.sync.read(readFileSync(inputPath))
const out = new PNG({ width: source.width * scale, height: source.height * scale })
const mask = new PNG({ width: source.width * scale, height: source.height * scale })

for (let y = 0; y < out.height; y += 1) {
  for (let x = 0; x < out.width; x += 1) {
    const sx = Math.floor(x / scale)
    const sy = Math.floor(y / scale)
    const src = (sy * source.width + sx) * 4
    const dst = (y * out.width + x) * 4
    const alpha = source.data[src + 3] / 255
    const threshold = (bayer8[y % 8][x % 8] + 0.5) / 64

    if (alpha < threshold * 0.95) {
      out.data[dst] = 0
      out.data[dst + 1] = 0
      out.data[dst + 2] = 0
      out.data[dst + 3] = 0
      mask.data[dst] = 255
      mask.data[dst + 1] = 255
      mask.data[dst + 2] = 255
      mask.data[dst + 3] = 0
      continue
    }

    out.data[dst] = quantize(source.data[src], x, y, 5)
    out.data[dst + 1] = quantize(source.data[src + 1], x + 3, y, 5)
    out.data[dst + 2] = quantize(source.data[src + 2], x, y + 5, 5)
    out.data[dst + 3] = 255

    const luma =
      out.data[dst] * 0.2126 +
      out.data[dst + 1] * 0.7152 +
      out.data[dst + 2] * 0.0722
    const depth = Math.max(58, Math.min(255, luma * 1.65))
    mask.data[dst] = 255
    mask.data[dst + 1] = 255
    mask.data[dst + 2] = 255
    mask.data[dst + 3] = depth
  }
}

writeFileSync(outputPath, PNG.sync.write(out))
writeFileSync(maskOutputPath, PNG.sync.write(mask))
