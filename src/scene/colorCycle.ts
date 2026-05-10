import { Color } from 'three'
import { REGIONS } from './regions'

const SECTION_COLORS = REGIONS.map((r) => new Color(r.accentColor))

// Mirrored ping-pong sequence: forward through colors, then back through the
// inner ones — avoids the harsh cyan→pink wrap of a plain modulo cycle.
// For N source colors the sequence has 2N-2 keyframes: [c0, c1, …, cN-1, cN-2, …, c1].
const CYCLE_COLORS: readonly Color[] = (() => {
  const fwd = SECTION_COLORS
  const back = SECTION_COLORS.slice(1, -1).reverse()
  return [...fwd, ...back]
})()

/**
 * Sample the ping-pong color cycle at normalized time t ∈ [0, 1).
 * Wraps periodically; t=0 and t=1 return the same color.
 *
 * Pass `target` to write into a caller-owned Color (no allocation per call).
 */
export function lerpColorThroughCycle(t: number, target?: Color): Color {
  const N = CYCLE_COLORS.length
  const f = ((t % 1) + 1) % 1 * N
  const i = Math.floor(f)
  const u = f - i
  const a = CYCLE_COLORS[i % N]
  const b = CYCLE_COLORS[(i + 1) % N]
  if (target) return target.copy(a).lerp(b, u)
  return a.clone().lerp(b, u)
}
