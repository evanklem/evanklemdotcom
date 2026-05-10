import { useState, type ReactNode } from 'react'
import { NavContext } from './navContext'
import type { SectionId } from './types'

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeRegion, setActiveRegion] = useState<SectionId | null>(null)
  return (
    <NavContext.Provider value={{ activeRegion, setActiveRegion }}>
      {children}
    </NavContext.Provider>
  )
}
