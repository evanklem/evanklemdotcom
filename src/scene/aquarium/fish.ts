import type { FishColor, FishInstance } from './types'
import { TANK_W, TANK_H } from './types'

export const FISH_COLORS: readonly FishColor[] = ['orange', 'lemon', 'red', 'pearl']

export const FISH_SRC: Record<FishColor, string> = {
  orange: '/textures/aquarium/fish/orange.png',
  lemon: '/textures/aquarium/fish/lemon.png',
  red: '/textures/aquarium/fish/red.png',
  pearl: '/textures/aquarium/fish/pearl.png',
}

// Fish sprite dimensions (matches scripts/dither-fish.mjs output)
export const FISH_W = 96
export const FISH_H = 56

// Per-fish runtime state. Position is persisted; velocity is re-initialized
// each session (fish wake up swimming).
export interface FishRuntime {
  instance: FishInstance
  vx: number
  vy: number
  // Targets that wander every few seconds for slight directional change.
  targetVx: number
  targetVy: number
  retargetIn: number // seconds until next retarget
}

const SPEED_PX_PER_SEC = 38
const VERTICAL_BIAS = 0.45

export function makeRuntime(instance: FishInstance): FishRuntime {
  const dir = Math.random() < 0.5 ? -1 : 1
  return {
    instance,
    vx: dir * SPEED_PX_PER_SEC,
    vy: (Math.random() - 0.5) * SPEED_PX_PER_SEC * VERTICAL_BIAS,
    targetVx: dir * SPEED_PX_PER_SEC,
    targetVy: (Math.random() - 0.5) * SPEED_PX_PER_SEC * VERTICAL_BIAS,
    retargetIn: 1 + Math.random() * 2.5,
  }
}

export function stepFish(rt: FishRuntime, dt: number): void {
  rt.retargetIn -= dt
  if (rt.retargetIn <= 0) {
    // Mostly keep current direction; small chance to flip.
    const flip = Math.random() < 0.18 ? -1 : 1
    rt.targetVx = flip * Math.sign(rt.vx || 1) * SPEED_PX_PER_SEC * (0.7 + Math.random() * 0.6)
    rt.targetVy = (Math.random() - 0.5) * SPEED_PX_PER_SEC * VERTICAL_BIAS
    rt.retargetIn = 1.2 + Math.random() * 2.8
  }
  // Smoothly steer toward target velocity.
  const k = 1 - Math.exp(-dt / 0.6)
  rt.vx += (rt.targetVx - rt.vx) * k
  rt.vy += (rt.targetVy - rt.vy) * k

  rt.instance.x += rt.vx * dt
  rt.instance.y += rt.vy * dt

  // Wall bounces (simple): clamp + reverse.
  const halfW = FISH_W / 2
  const halfH = FISH_H / 2
  if (rt.instance.x < halfW) {
    rt.instance.x = halfW
    rt.vx = Math.abs(rt.vx)
    rt.targetVx = Math.abs(rt.targetVx)
  } else if (rt.instance.x > TANK_W - halfW) {
    rt.instance.x = TANK_W - halfW
    rt.vx = -Math.abs(rt.vx)
    rt.targetVx = -Math.abs(rt.targetVx)
  }
  if (rt.instance.y < halfH) {
    rt.instance.y = halfH
    rt.vy = Math.abs(rt.vy)
    rt.targetVy = Math.abs(rt.targetVy)
  } else if (rt.instance.y > TANK_H - halfH) {
    rt.instance.y = TANK_H - halfH
    rt.vy = -Math.abs(rt.vy)
    rt.targetVy = -Math.abs(rt.targetVy)
  }
}

export function isFacingLeft(rt: FishRuntime): boolean {
  return rt.vx < 0
}
