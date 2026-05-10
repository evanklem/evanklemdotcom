import { describe, it, expect, beforeEach } from 'vitest'
import { encode, decode, emptyState, save, load, clear } from '../persistence'
import { SAND_W, SAND_H, type AquariumState } from '../types'

function makeState(overrides: Partial<AquariumState> = {}): AquariumState {
  return {
    version: 1,
    sand: new Uint8Array(SAND_W * SAND_H),
    decor: [],
    fish: [],
    ...overrides,
  }
}

describe('aquarium persistence', () => {
  beforeEach(() => {
    clear()
  })

  it('round-trips empty state', () => {
    const s = emptyState()
    const decoded = decode(encode(s))
    expect(decoded).not.toBeNull()
    expect(decoded?.version).toBe(1)
    expect(decoded?.sand.length).toBe(SAND_W * SAND_H)
    expect(decoded?.decor).toEqual([])
    expect(decoded?.fish).toEqual([])
  })

  it('round-trips sand bytes precisely', () => {
    const sand = new Uint8Array(SAND_W * SAND_H)
    sand[0] = 1
    sand[42] = 1
    sand[sand.length - 1] = 1
    const decoded = decode(encode(makeState({ sand })))
    expect(decoded?.sand[0]).toBe(1)
    expect(decoded?.sand[42]).toBe(1)
    expect(decoded?.sand[sand.length - 1]).toBe(1)
    expect(decoded?.sand[1]).toBe(0)
  })

  it('round-trips decor and fish lists', () => {
    const state = makeState({
      decor: [{ instanceId: 'd1', decorId: 'castle', x: 100, y: 200 }],
      fish: [{ instanceId: 'f1', color: 'orange', x: 50, y: 60 }],
    })
    const decoded = decode(encode(state))
    expect(decoded?.decor).toEqual(state.decor)
    expect(decoded?.fish).toEqual(state.fish)
  })

  it('returns null on malformed JSON', () => {
    expect(decode('not json')).toBeNull()
  })

  it('returns null on wrong version', () => {
    expect(decode(JSON.stringify({ version: 2, sand: '', decor: [], fish: [] }))).toBeNull()
  })

  it('returns null when sand size mismatches', () => {
    const bad = JSON.stringify({ version: 1, sand: 'AA==', decor: [], fish: [] })
    expect(decode(bad)).toBeNull()
  })

  it('save/load round-trips through localStorage', () => {
    const state = makeState({
      decor: [{ instanceId: 'd1', decorId: 'plant-tall', x: 1, y: 2 }],
    })
    save(state)
    const loaded = load()
    expect(loaded.decor).toEqual(state.decor)
  })

  it('load returns empty state when nothing stored', () => {
    expect(load().decor).toEqual([])
  })

  it('load returns empty state when stored payload is corrupted', () => {
    window.localStorage.setItem('surf:aquarium:v1', 'garbage')
    expect(load().sand.length).toBe(SAND_W * SAND_H)
  })
})
