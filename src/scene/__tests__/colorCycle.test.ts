import { describe, it, expect } from 'vitest'
import { Color } from 'three'
import { lerpColorThroughCycle } from '../colorCycle'
import { REGIONS } from '../regions'

const eps = 1e-6

function colorEq(a: Color, b: Color): boolean {
  return Math.abs(a.r - b.r) < eps && Math.abs(a.g - b.g) < eps && Math.abs(a.b - b.b) < eps
}

describe('lerpColorThroughCycle (ping-pong)', () => {
  // The mirrored sequence has 2*N-2 = 4 keyframes for N=3 regions.
  // Keyframe order: [pink, lime, indigo, lime] then wraps to pink.
  const KF = 4

  it('hits each region color exactly at its keyframe boundary', () => {
    const pink = new Color(REGIONS[0].accentColor)
    const lime = new Color(REGIONS[1].accentColor)
    const indigo = new Color(REGIONS[2].accentColor)

    expect(colorEq(lerpColorThroughCycle(0 / KF), pink)).toBe(true)
    expect(colorEq(lerpColorThroughCycle(1 / KF), lime)).toBe(true)
    expect(colorEq(lerpColorThroughCycle(2 / KF), indigo)).toBe(true)
    // Mirror — segment 3 returns to lime.
    expect(colorEq(lerpColorThroughCycle(3 / KF), lime)).toBe(true)
  })

  it('wraps cleanly back to pink at t=1', () => {
    // t=1 should equal t=0 (the cycle is periodic).
    const pink = new Color(REGIONS[0].accentColor)
    // Using a t just shy of 1 to avoid floating-point boundary games.
    const nearEnd = lerpColorThroughCycle(0.99999)
    // Last segment (index 3 → 0) should be very close to pink as t→1.
    expect(Math.abs(nearEnd.r - pink.r)).toBeLessThan(0.001)
    expect(Math.abs(nearEnd.g - pink.g)).toBeLessThan(0.001)
    expect(Math.abs(nearEnd.b - pink.b)).toBeLessThan(0.001)
  })

  it('interpolates between keyframes (midpoint of segment is mix of endpoints)', () => {
    // Midway through segment 0 (pink → lime) should be the average.
    const pink = new Color(REGIONS[0].accentColor)
    const lime = new Color(REGIONS[1].accentColor)
    const mid = lerpColorThroughCycle(0.5 / KF)
    expect(Math.abs(mid.r - (pink.r + lime.r) / 2)).toBeLessThan(eps)
    expect(Math.abs(mid.g - (pink.g + lime.g) / 2)).toBeLessThan(eps)
    expect(Math.abs(mid.b - (pink.b + lime.b) / 2)).toBeLessThan(eps)
  })

  it('reverses direction at the indigo apex (no jump from indigo to pink)', () => {
    // Just before t=2/KF we should be approaching indigo from lime.
    // Just after t=2/KF we should be moving from indigo back toward lime.
    // A small step on each side should give symmetric distance from indigo.
    const indigo = new Color(REGIONS[2].accentColor)
    const before = lerpColorThroughCycle(2 / KF - 0.01)
    const after = lerpColorThroughCycle(2 / KF + 0.01)
    // Both sides should be close to indigo (within the same step distance).
    const dBefore = Math.hypot(before.r - indigo.r, before.g - indigo.g, before.b - indigo.b)
    const dAfter = Math.hypot(after.r - indigo.r, after.g - indigo.g, after.b - indigo.b)
    expect(Math.abs(dBefore - dAfter)).toBeLessThan(0.01)
    // Crucially: this distance must be much smaller than lime→pink distance,
    // proving we didn't jump straight from indigo to pink (the old wrap bug).
    const lime = new Color(REGIONS[1].accentColor)
    const pink = new Color(REGIONS[0].accentColor)
    const limeToPink = Math.hypot(lime.r - pink.r, lime.g - pink.g, lime.b - pink.b)
    expect(dBefore).toBeLessThan(limeToPink * 0.3)
  })
})
