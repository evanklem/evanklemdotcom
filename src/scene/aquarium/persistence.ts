import type { AquariumState } from './types'
import { SAND_W, SAND_H } from './types'

const STORAGE_KEY = 'surf:aquarium:v1'

interface SerializedState {
  version: 1
  sand: string
  decor: AquariumState['decor']
  fish: AquariumState['fish']
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encode(state: AquariumState): string {
  const payload: SerializedState = {
    version: 1,
    sand: bytesToBase64(state.sand),
    decor: state.decor,
    fish: state.fish,
  }
  return JSON.stringify(payload)
}

export function decode(raw: string): AquariumState | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const p = parsed as Partial<SerializedState>
  if (p.version !== 1) return null
  if (typeof p.sand !== 'string') return null
  if (!Array.isArray(p.decor) || !Array.isArray(p.fish)) return null
  const sand = base64ToBytes(p.sand)
  if (sand.length !== SAND_W * SAND_H) return null
  return { version: 1, sand, decor: p.decor, fish: p.fish }
}

export function emptyState(): AquariumState {
  return {
    version: 1,
    sand: new Uint8Array(SAND_W * SAND_H),
    decor: [],
    fish: [],
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function save(state: AquariumState): void {
  const ls = getStorage()
  if (!ls) return
  try {
    ls.setItem(STORAGE_KEY, encode(state))
  } catch {
    // Quota or disabled storage — silently ignore.
  }
}

export function load(): AquariumState {
  const ls = getStorage()
  if (!ls) return emptyState()
  const raw = ls.getItem(STORAGE_KEY)
  if (!raw) return emptyState()
  return decode(raw) ?? emptyState()
}

export function clear(): void {
  const ls = getStorage()
  if (!ls) return
  ls.removeItem(STORAGE_KEY)
}
