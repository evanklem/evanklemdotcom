import { useEffect, useRef } from 'react'
import { useSpring, type SpringValue } from '@react-spring/three'

const IDLE_THRESHOLD_MS = 4000
const BREATH_AMPLITUDE = 0.012
const BREATH_PERIOD_MS = 4500

/**
 * Idle breath: when no pointer/keyboard interaction has happened in a few
 * seconds, drift the scale gently as a "breath." Returns a spring scale value
 * to apply to the sphere group.
 */
export function useIdleBreath(): { breathScale: SpringValue<number> } {
  const [{ breathScale }, api] = useSpring(() => ({ breathScale: 1 }))
  const lastInteractionRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    lastInteractionRef.current = Date.now()
    const bump = () => {
      lastInteractionRef.current = Date.now()
    }
    window.addEventListener('pointerdown', bump, { passive: true })
    window.addEventListener('pointermove', bump, { passive: true })
    window.addEventListener('keydown', bump)

    const tick = () => {
      const now = Date.now()
      const idleFor = now - lastInteractionRef.current
      if (idleFor > IDLE_THRESHOLD_MS) {
        const t = ((now - lastInteractionRef.current - IDLE_THRESHOLD_MS) / BREATH_PERIOD_MS) *
          Math.PI * 2
        const target = 1 + Math.sin(t) * BREATH_AMPLITUDE
        api.start({ breathScale: target, immediate: true })
      } else {
        api.start({ breathScale: 1, config: { mass: 1, tension: 80, friction: 20 } })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointerdown', bump)
      window.removeEventListener('pointermove', bump)
      window.removeEventListener('keydown', bump)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [api])

  return { breathScale }
}
