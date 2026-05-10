import { SAND_W, SAND_H, SAND_CELL, TANK_W, TANK_H } from './types'
import type { AquariumState, DecorInstance } from './types'
import { tickSandInPlace } from './sandCA'
import { DECOR_CATALOG, getDecor } from './decor'
import { FISH_SRC, FISH_COLORS, FISH_W, FISH_H, makeRuntime, stepFish, isFacingLeft, type FishRuntime } from './fish'

interface ImageMap {
  fish: Map<string, HTMLImageElement>
  decor: Map<string, HTMLImageElement>
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`failed to load ${src}`))
    img.src = src
  })
}

export async function preloadImages(): Promise<ImageMap> {
  const fish = new Map<string, HTMLImageElement>()
  const decor = new Map<string, HTMLImageElement>()
  await Promise.all([
    ...FISH_COLORS.map(async (c) => fish.set(c, await loadImage(FISH_SRC[c]))),
    ...DECOR_CATALOG.map(async (d) => decor.set(d.id, await loadImage(d.src))),
  ])
  return { fish, decor }
}

interface RenderContext {
  ctx: CanvasRenderingContext2D
  images: ImageMap
}

function drawWaterBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, TANK_H)
  grad.addColorStop(0, '#bff3ff')
  grad.addColorStop(0.5, '#7fd9ff')
  grad.addColorStop(1, '#3aa8d8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, TANK_W, TANK_H)
  // Soft top highlight band — Frutiger sheen.
  const sheen = ctx.createLinearGradient(0, 0, 0, TANK_H * 0.32)
  sheen.addColorStop(0, 'rgba(255,255,255,0.45)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, TANK_W, TANK_H * 0.32)
}

function drawSand(ctx: CanvasRenderingContext2D, sand: Uint8Array) {
  // Render sand as 4×4 cells in a warm tan color.
  ctx.fillStyle = '#d8b376'
  for (let y = 0; y < SAND_H; y += 1) {
    for (let x = 0; x < SAND_W; x += 1) {
      if (sand[y * SAND_W + x] === 1) {
        ctx.fillRect(x * SAND_CELL, y * SAND_CELL, SAND_CELL, SAND_CELL)
      }
    }
  }
}

function drawDecor(ctx: CanvasRenderingContext2D, decor: DecorInstance[], images: ImageMap['decor']) {
  // Sort by y so closer-to-front decor renders on top.
  const sorted = [...decor].sort((a, b) => a.y - b.y)
  for (const d of sorted) {
    const meta = getDecor(d.decorId)
    const img = images.get(d.decorId)
    if (!meta || !img) continue
    ctx.drawImage(img, d.x, d.y, meta.width, meta.height)
  }
}

function drawFish(ctx: CanvasRenderingContext2D, fish: FishRuntime[], images: ImageMap['fish']) {
  for (const rt of fish) {
    const img = images.get(rt.instance.color)
    if (!img) continue
    const x = Math.round(rt.instance.x - FISH_W / 2)
    const y = Math.round(rt.instance.y - FISH_H / 2)
    if (isFacingLeft(rt)) {
      ctx.save()
      ctx.translate(x + FISH_W, y)
      ctx.scale(-1, 1)
      ctx.drawImage(img, 0, 0, FISH_W, FISH_H)
      ctx.restore()
    } else {
      ctx.drawImage(img, x, y, FISH_W, FISH_H)
    }
  }
}

export interface TankRunner {
  stop(): void
  setOnTick(cb: (state: AquariumState) => void): void
}

export interface TankRunnerOpts {
  canvas: HTMLCanvasElement
  state: AquariumState
  images: ImageMap
}

// Owns the rAF loop, sand-tick scheduling, and fish stepping. Does not own
// the AquariumState; mutations to state.sand and state.decor by the caller
// are reflected on the next render.
export function startTank({ canvas, state, images }: TankRunnerOpts): TankRunner {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { stop: () => {}, setOnTick: () => {} }
  }
  ctx.imageSmoothingEnabled = false

  const fishRuntimes: FishRuntime[] = state.fish.map(makeRuntime)
  let last = performance.now()
  let sandAccumMs = 0
  const SAND_TICK_MS = 1000 / 30 // 30 Hz CA
  let raf = 0
  let stopped = false
  let onTick: ((s: AquariumState) => void) | null = null

  const tick = (now: number) => {
    if (stopped) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    sandAccumMs += dt * 1000
    while (sandAccumMs >= SAND_TICK_MS) {
      tickSandInPlace(state.sand)
      sandAccumMs -= SAND_TICK_MS
    }
    // Sync runtime fish list with persisted fish list (additions/removals).
    if (fishRuntimes.length !== state.fish.length) {
      // Add new fish
      while (fishRuntimes.length < state.fish.length) {
        fishRuntimes.push(makeRuntime(state.fish[fishRuntimes.length]))
      }
      // Remove old fish
      while (fishRuntimes.length > state.fish.length) {
        fishRuntimes.pop()
      }
    }
    for (let i = 0; i < fishRuntimes.length; i += 1) {
      fishRuntimes[i].instance = state.fish[i]
      stepFish(fishRuntimes[i], dt)
    }
    drawWaterBackground(ctx)
    drawSand(ctx, state.sand)
    drawDecor(ctx, state.decor, images.decor)
    drawFish(ctx, fishRuntimes, images.fish)
    onTick?.(state)
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  return {
    stop: () => {
      stopped = true
      cancelAnimationFrame(raf)
    },
    setOnTick: (cb) => {
      onTick = cb
    },
  }
}

// Convert a (canvas-px) pointer position to (logical) tank coords.
export function canvasToLogical(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const sx = (clientX - rect.left) / rect.width
  const sy = (clientY - rect.top) / rect.height
  return { x: sx * TANK_W, y: sy * TANK_H }
}

// Re-export render context helper.
export type { RenderContext, ImageMap }
