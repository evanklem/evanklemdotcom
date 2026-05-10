export interface DecorCatalogEntry {
  id: string
  label: string
  src: string
  width: number
  height: number
}

export const DECOR_CATALOG: readonly DecorCatalogEntry[] = [
  { id: 'castle', label: 'Castle', src: '/textures/aquarium/decor/castle.png', width: 80, height: 64 },
  { id: 'plant-tall', label: 'Tall plant', src: '/textures/aquarium/decor/plant-tall.png', width: 56, height: 80 },
  { id: 'plant-bushy', label: 'Bush', src: '/textures/aquarium/decor/plant-bushy.png', width: 64, height: 56 },
  { id: 'rock-small', label: 'Rock', src: '/textures/aquarium/decor/rock-small.png', width: 48, height: 32 },
  { id: 'rock-large', label: 'Big rock', src: '/textures/aquarium/decor/rock-large.png', width: 72, height: 48 },
  { id: 'bubbler', label: 'Bubbler', src: '/textures/aquarium/decor/bubbler.png', width: 40, height: 96 },
  { id: 'chest', label: 'Chest', src: '/textures/aquarium/decor/chest.png', width: 64, height: 48 },
  { id: 'driftwood', label: 'Driftwood', src: '/textures/aquarium/decor/driftwood.png', width: 96, height: 40 },
] as const

export function getDecor(id: string): DecorCatalogEntry | undefined {
  return DECOR_CATALOG.find((d) => d.id === id)
}

let _id = 0
export function newInstanceId(prefix: string): string {
  _id += 1
  return `${prefix}-${Date.now().toString(36)}-${_id}`
}
