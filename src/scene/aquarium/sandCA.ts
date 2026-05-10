import { SAND_W, SAND_H } from './types'

// Cellular-automaton tick for falling sand.
// Cells are 0 (empty) or 1 (sand). Iterating bottom-up, each sand cell tries:
//   1) move straight down
//   2) move diagonally down-left
//   3) move diagonally down-right
// Diagonal direction starts from a per-row parity to avoid biasing flow.
//
// This is a pure function: returns a new buffer; the input is not mutated.
// Callers can also use tickSandInPlace if they own a writable buffer.

export function tickSand(prev: Uint8Array, w: number = SAND_W, h: number = SAND_H): Uint8Array {
  const next = new Uint8Array(prev)
  return tickSandInPlace(next, w, h)
}

export function tickSandInPlace(grid: Uint8Array, w: number = SAND_W, h: number = SAND_H): Uint8Array {
  // Iterate bottom-up so a cell that just landed isn't moved twice this tick.
  for (let y = h - 2; y >= 0; y -= 1) {
    // Alternate horizontal scan direction per row to avoid a sideways bias
    // when diagonals slip.
    const leftFirst = y % 2 === 0
    if (leftFirst) {
      for (let x = 0; x < w; x += 1) trySettle(grid, x, y, w, h)
    } else {
      for (let x = w - 1; x >= 0; x -= 1) trySettle(grid, x, y, w, h)
    }
  }
  return grid
}

function trySettle(grid: Uint8Array, x: number, y: number, w: number, _h: number) {
  const idx = y * w + x
  if (grid[idx] !== 1) return
  const below = (y + 1) * w + x
  if (grid[below] === 0) {
    grid[idx] = 0
    grid[below] = 1
    return
  }
  // Diagonal slip: prefer the side with parity of (x+y) for jitter.
  const tryLeftFirst = ((x + y) & 1) === 0
  const dl = (y + 1) * w + (x - 1)
  const dr = (y + 1) * w + (x + 1)
  const canLeft = x > 0 && grid[dl] === 0
  const canRight = x < w - 1 && grid[dr] === 0
  if (tryLeftFirst) {
    if (canLeft) {
      grid[idx] = 0
      grid[dl] = 1
    } else if (canRight) {
      grid[idx] = 0
      grid[dr] = 1
    }
  } else {
    if (canRight) {
      grid[idx] = 0
      grid[dr] = 1
    } else if (canLeft) {
      grid[idx] = 0
      grid[dl] = 1
    }
  }
}

// Paints a circular brush of sand at logical (cx, cy) cell coords with radius r.
// Cells outside the grid are ignored. Mutates the grid.
export function paintSand(grid: Uint8Array, cx: number, cy: number, r: number, w: number = SAND_W, h: number = SAND_H): void {
  const r2 = r * r
  const x0 = Math.max(0, Math.floor(cx - r))
  const x1 = Math.min(w - 1, Math.ceil(cx + r))
  const y0 = Math.max(0, Math.floor(cy - r))
  const y1 = Math.min(h - 1, Math.ceil(cy + r))
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) grid[y * w + x] = 1
    }
  }
}

export function eraseSand(grid: Uint8Array, cx: number, cy: number, r: number, w: number = SAND_W, h: number = SAND_H): void {
  const r2 = r * r
  const x0 = Math.max(0, Math.floor(cx - r))
  const x1 = Math.min(w - 1, Math.ceil(cx + r))
  const y0 = Math.max(0, Math.floor(cy - r))
  const y1 = Math.min(h - 1, Math.ceil(cy + r))
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy <= r2) grid[y * w + x] = 0
    }
  }
}
