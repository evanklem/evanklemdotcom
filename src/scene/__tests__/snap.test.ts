import { describe, it, expect } from 'vitest'
import { snapTarget, snapTargetTo } from '../regions'

describe('snapTarget', () => {
  it('returns currentRotation unchanged when already on a region', () => {
    // Rotation π centers ART; its rotationToCenter is also π.
    const result = snapTarget(Math.PI)
    expect(result.region.id).toBe('art')
    expect(result.targetAngle).toBeCloseTo(Math.PI, 5)
  })

  it('snaps forward through wrap when forward is shorter', () => {
    // 350° is closest to ABOUT (which centers at rotation 0 / 2π).
    // Forward delta = +10° lands at 2π, not back at 0.
    const cur = (350 / 180) * Math.PI
    const result = snapTarget(cur)
    expect(result.region.id).toBe('about')
    expect(result.targetAngle).toBeCloseTo(2 * Math.PI, 5)
  })

  it('snaps backward when backward is shorter', () => {
    // π/8 sits inside ABOUT's basin. Backward delta -π/8.
    const result = snapTarget(Math.PI / 8)
    expect(result.region.id).toBe('about')
    expect(result.targetAngle).toBeCloseTo(0, 5)
  })

  it('preserves multi-rotation offsets', () => {
    const cur = 6 * Math.PI + Math.PI / 8
    const result = snapTarget(cur)
    expect(result.region.id).toBe('about')
    expect(result.targetAngle).toBeCloseTo(6 * Math.PI, 5)
  })

  it('handles negative rotations', () => {
    // -π/2 centers PROJECTS. Already on region.
    const result = snapTarget(-Math.PI / 2)
    expect(result.region.id).toBe('projects')
    expect(result.targetAngle).toBeCloseTo(-Math.PI / 2, 5)
  })
})

describe('snapTargetTo', () => {
  it('targets the requested region regardless of current rotation', () => {
    // From rotation 0, snap to ART (rotationToCenter = -π, equivalently π).
    const result = snapTargetTo(0, 'art')
    expect(result.region.id).toBe('art')
    expect(result.targetAngle).toBeCloseTo(-Math.PI, 5)
  })

  it('chooses shortest arc to the target region', () => {
    // From rotation 0, snap to PROJECTS (rotationToCenter = -π/2).
    // Shortest arc is -π/2 (forward 3π/2 is longer).
    const result = snapTargetTo(0, 'projects')
    expect(result.region.id).toBe('projects')
    expect(result.targetAngle).toBeCloseTo(-Math.PI / 2, 5)
  })

  it('preserves multi-rotation offsets', () => {
    const cur = 2 * Math.PI + Math.PI / 8
    const result = snapTargetTo(cur, 'about')
    expect(result.region.id).toBe('about')
    expect(result.targetAngle).toBeCloseTo(2 * Math.PI, 5)
  })

  it('throws on unknown region', () => {
    expect(() => snapTargetTo(0, 'nope' as never)).toThrow()
  })
})
