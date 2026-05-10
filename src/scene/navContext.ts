import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { SectionId } from './types'

export interface NavState {
  activeRegion: SectionId | null
  setActiveRegion: Dispatch<SetStateAction<SectionId | null>>
}

export const NavContext = createContext<NavState | null>(null)

export function useNavState(): NavState {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavState must be used inside <NavProvider>')
  return ctx
}
