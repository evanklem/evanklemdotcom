export type FishColor = 'orange' | 'lemon' | 'red' | 'pearl'

export interface DecorInstance {
  instanceId: string
  decorId: string
  x: number
  y: number
}

export interface FishInstance {
  instanceId: string
  color: FishColor
  x: number
  y: number
}

export interface AquariumState {
  version: 1
  sand: Uint8Array
  decor: DecorInstance[]
  fish: FishInstance[]
}

export const TANK_W = 800
export const TANK_H = 500
export const SAND_CELL = 4
export const SAND_W = TANK_W / SAND_CELL
export const SAND_H = TANK_H / SAND_CELL
