import { describe, it, expect } from 'vitest'
import { tickSand, paintSand, eraseSand } from '../sandCA'

// Helper: build a small grid as a 2D string for readability.
// '.' = empty, 'x' = sand. Each row is a string of length w; total h rows.
function fromAscii(rows: string[]): { grid: Uint8Array; w: number; h: number } {
  const h = rows.length
  const w = rows[0].length
  const grid = new Uint8Array(w * h)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      grid[y * w + x] = rows[y][x] === 'x' ? 1 : 0
    }
  }
  return { grid, w, h }
}

function toAscii(grid: Uint8Array, w: number, h: number): string[] {
  const rows: string[] = []
  for (let y = 0; y < h; y += 1) {
    let row = ''
    for (let x = 0; x < w; x += 1) row += grid[y * w + x] === 1 ? 'x' : '.'
    rows.push(row)
  }
  return rows
}

describe('tickSand', () => {
  it('drops a single sand cell straight down', () => {
    const { grid, w, h } = fromAscii(['..x..', '.....', '.....', '.....'])
    const next = tickSand(grid, w, h)
    expect(toAscii(next, w, h)).toEqual(['.....', '..x..', '.....', '.....'])
  })

  it('stops at the floor', () => {
    const { grid, w, h } = fromAscii(['.....', '.....', '.....', '..x..'])
    const next = tickSand(grid, w, h)
    expect(toAscii(next, w, h)).toEqual(['.....', '.....', '.....', '..x..'])
  })

  it('slips diagonally when blocked directly below', () => {
    const { grid, w, h } = fromAscii(['..x..', '..x..', '..x..'])
    const next = tickSand(grid, w, h)
    const ascii = toAscii(next, w, h)
    // Top row should empty as that cell drops or slips.
    expect(ascii[0].includes('x')).toBe(false)
    // Total mass is conserved across one tick.
    const total = next.reduce((s, v) => s + v, 0)
    expect(total).toBe(3)
    // The bottom row should have absorbed at least one slipped cell so it
    // contains either 1 or 2 sand cells (one always stays at (2,2)).
    const bottomCount = (ascii[2].match(/x/g) ?? []).length
    expect(bottomCount).toBeGreaterThanOrEqual(1)
    expect(bottomCount).toBeLessThanOrEqual(3)
  })

  it('does not move sand when the cell below and both diagonals are blocked', () => {
    const { grid, w, h } = fromAscii(['..x..', '.xxx.'])
    const next = tickSand(grid, w, h)
    expect(toAscii(next, w, h)).toEqual(['..x..', '.xxx.'])
  })

  it('settles a vertical column over multiple ticks into a pile', () => {
    const { grid: initialGrid, w, h } = fromAscii([
      '..x..',
      '..x..',
      '..x..',
      '..x..',
      '.....',
    ])
    let grid = initialGrid
    for (let i = 0; i < 10; i += 1) grid = tickSand(grid, w, h)
    // After enough ticks, the four sand cells should be on the floor,
    // arranged in a small pile (4 cells; not all stacked vertically).
    const total = grid.reduce((s, v) => s + v, 0)
    expect(total).toBe(4)
    // Bottom row should contain at least 2 sand cells (sand piles spread).
    const bottomRowCount = (() => {
      let c = 0
      for (let x = 0; x < w; x += 1) c += grid[(h - 1) * w + x]
      return c
    })()
    expect(bottomRowCount).toBeGreaterThanOrEqual(2)
  })

  it('preserves total sand mass across ticks', () => {
    const { grid, w, h } = fromAscii([
      '.x.x.x.',
      '.......',
      '.x.x.x.',
      '.......',
      '.......',
    ])
    let g = grid
    const initialMass = g.reduce((s, v) => s + v, 0)
    for (let i = 0; i < 20; i += 1) g = tickSand(g, w, h)
    expect(g.reduce((s, v) => s + v, 0)).toBe(initialMass)
  })
})

describe('paintSand / eraseSand', () => {
  it('paints a circular brush of sand', () => {
    const grid = new Uint8Array(10 * 10)
    paintSand(grid, 5, 5, 1, 10, 10)
    // Brush radius 1 covers center + 4 neighbors at minimum.
    expect(grid[5 * 10 + 5]).toBe(1)
    expect(grid[5 * 10 + 4]).toBe(1)
    expect(grid[5 * 10 + 6]).toBe(1)
    expect(grid[4 * 10 + 5]).toBe(1)
    expect(grid[6 * 10 + 5]).toBe(1)
  })

  it('clamps brush at grid edges', () => {
    const grid = new Uint8Array(10 * 10)
    paintSand(grid, 0, 0, 5, 10, 10)
    // Should not throw and should set the corner
    expect(grid[0]).toBe(1)
  })

  it('eraseSand clears a circular region', () => {
    const grid = new Uint8Array(10 * 10).fill(1)
    eraseSand(grid, 5, 5, 1, 10, 10)
    expect(grid[5 * 10 + 5]).toBe(0)
    expect(grid[5 * 10 + 4]).toBe(0)
    // Outside brush still 1.
    expect(grid[0 * 10 + 0]).toBe(1)
  })
})
