import { describe, it, expect } from 'vitest'
import { nearestRegion } from '../regions'

describe('nearestRegion', () => {
  it('returns about at rotation 0', () => {
    expect(nearestRegion(0).id).toBe('about')
  })

  it('returns the region whose face is currently centered toward the camera', () => {
    // Mesh rotation r brings the region with objectAngle (-r mod 2π) to +Z.
    // ART has objectAngle π. At r = π, it centers.
    expect(nearestRegion(Math.PI).id).toBe('art')
    // PROJECTS has objectAngle π/2 (≡ -3π/2). At r = 3π/2, it centers.
    expect(nearestRegion((3 * Math.PI) / 2).id).toBe('projects')
  })

  it('wraps positive past 2π', () => {
    expect(nearestRegion(2 * Math.PI).id).toBe('about')
  })

  it('wraps negative angles', () => {
    expect(nearestRegion(-Math.PI / 2).id).toBe('projects')
    expect(nearestRegion(-Math.PI).id).toBe('art')
  })

  it('snaps to closer region when between two', () => {
    // π/8 is closer to 0 (ABOUT centered) than to π (ART centered)
    expect(nearestRegion(Math.PI / 8).id).toBe('about')
    // 11π/8 is closer to 3π/2 (PROJECTS centered) than to π (ART centered)
    expect(nearestRegion((11 * Math.PI) / 8).id).toBe('projects')
  })
})
