import type { Region, SectionId, SnapResult } from './types'

const TAU = Math.PI * 2

// Vibrant per-section hues used for: floating chip glow, model recolor tint,
// halo behind revealed model, lava-lamp hue shift when active, panel border.
// Chartreuse `#c4ff00` remains the global UI accent (cursor, default rims).
export const REGIONS: readonly Region[] = [
  { id: 'about', objectAngle: 0, accentColor: '#ff3a8a' }, // pink
  { id: 'projects', objectAngle: Math.PI / 2, accentColor: '#b8ff2e' }, // lime
  { id: 'art', objectAngle: Math.PI, accentColor: '#5b3aff' }, // indigo
]

function signedShortestArc(from: number, to: number): number {
  return ((((to - from) % TAU) + TAU + Math.PI) % TAU) - Math.PI
}

/**
 * The mesh rotation_y value that brings `region` to face the camera.
 * After rotating the sphere by `r`, the point originally at object angle `-r`
 * (mod 2π) sits at world +Z, so the rotation we want is `-objectAngle`.
 */
function rotationToCenter(region: Region): number {
  return -region.objectAngle
}

export function nearestRegion(rotationY: number): Region {
  let best = REGIONS[0]
  let bestDist = Math.abs(signedShortestArc(rotationY, rotationToCenter(best)))
  for (let i = 1; i < REGIONS.length; i++) {
    const d = Math.abs(signedShortestArc(rotationY, rotationToCenter(REGIONS[i])))
    if (d < bestDist) {
      best = REGIONS[i]
      bestDist = d
    }
  }
  return best
}

export function snapTarget(currentRotation: number): SnapResult {
  const region = nearestRegion(currentRotation)
  const delta = signedShortestArc(currentRotation, rotationToCenter(region))
  return { region, targetAngle: currentRotation + delta }
}

export function snapTargetTo(currentRotation: number, regionId: SectionId): SnapResult {
  const region = REGIONS.find((r) => r.id === regionId)
  if (!region) throw new Error(`Unknown region: ${regionId}`)
  const delta = signedShortestArc(currentRotation, rotationToCenter(region))
  return { region, targetAngle: currentRotation + delta }
}
