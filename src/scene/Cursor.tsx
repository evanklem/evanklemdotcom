import { useEffect, useRef } from 'react'
import '../styles/cursor.css'

const LAG = 1 // 0..1 per-frame lerp factor toward target

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Skip entirely on touch-only devices.
    if (typeof window === 'undefined') return
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (isTouch) return

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null
      const interactive = !!t?.closest?.('[data-interactive], a, button, [role="button"]')
      const text =
        !interactive &&
        !!t?.closest?.(
          'input, textarea, [contenteditable="true"], p, h1, h2, h3, h4, h5, h6, li, .panel__body, .section-panel',
        )
      ringRef.current?.classList.toggle('cursor--hover', interactive)
      ringRef.current?.classList.toggle('cursor--text', text)
    }

    const onDown = () => ringRef.current?.classList.add('cursor--down')
    const onUp = () => ringRef.current?.classList.remove('cursor--down')

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerover', onOver)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    const tick = () => {
      ring.current.x += (target.current.x - ring.current.x) * LAG
      ring.current.y += (target.current.y - ring.current.y) * LAG
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <div ref={ringRef} className="cursor" aria-hidden="true" />
}
