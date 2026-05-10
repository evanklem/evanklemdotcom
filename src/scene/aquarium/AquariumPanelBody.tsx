import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import '../../styles/aquarium.css'
import {
  TANK_W,
  TANK_H,
  SAND_CELL,
  type AquariumState,
  type FishColor,
  type DecorInstance,
} from './types'
import { paintSand, eraseSand } from './sandCA'
import { DECOR_CATALOG, getDecor, newInstanceId } from './decor'
import { FISH_COLORS } from './fish'
import { load, save, emptyState } from './persistence'
import { canvasToLogical, preloadImages, startTank, type ImageMap } from './tank'

type Tool = 'select' | 'sand' | 'erase' | 'fish'

const SAND_BRUSH_RADIUS_CELLS = 5
const ERASE_BRUSH_RADIUS_CELLS = 6
const SAVE_DEBOUNCE_MS = 600

export function AquariumPanelBody({ closeButton }: { closeButton: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<AquariumState>(emptyState())
  const imagesRef = useRef<ImageMap | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = useRef<{ kind: 'paint' | 'erase' | 'placeDecor'; decorId?: string } | null>(null)

  const [tool, setTool] = useState<Tool>('sand')
  const [, forceTick] = useState(0)
  const [imagesReady, setImagesReady] = useState(false)
  const [draggingDecor, setDraggingDecor] = useState<string | null>(null)
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null)
  const [counts, setCounts] = useState({ fish: 0, decor: 0 })

  const syncCounts = useCallback(() => {
    setCounts({
      fish: stateRef.current.fish.length,
      decor: stateRef.current.decor.length,
    })
  }, [])

  // Initial load + image preload + tank start
  useEffect(() => {
    stateRef.current = load()
    syncCounts()
    let cleanup: (() => void) | null = null
    let cancelled = false
    preloadImages().then((images) => {
      if (cancelled) return
      imagesRef.current = images
      setImagesReady(true)
      const canvas = canvasRef.current
      if (!canvas) return
      const runner = startTank({ canvas, state: stateRef.current, images })
      cleanup = () => runner.stop()
    }).catch(() => {
      // Image load failure: silently render with placeholder bg
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [syncCounts])

  const queueSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      save(stateRef.current)
    }, SAVE_DEBOUNCE_MS)
  }, [])

  const handleReset = useCallback(() => {
    stateRef.current = emptyState()
    save(stateRef.current)
    syncCounts()
    forceTick((n) => n + 1)
  }, [syncCounts])

  const handleAddFish = useCallback(() => {
    const color: FishColor = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)]
    stateRef.current.fish.push({
      instanceId: newInstanceId('fish'),
      color,
      x: TANK_W / 2 + (Math.random() - 0.5) * 200,
      y: TANK_H * 0.4 + Math.random() * (TANK_H * 0.3),
    })
    queueSave()
    syncCounts()
    forceTick((n) => n + 1)
  }, [queueSave, syncCounts])

  const onPointerDownCanvas = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const { x, y } = canvasToLogical(e.currentTarget, e.clientX, e.clientY)
    if (tool === 'sand') {
      const cx = x / SAND_CELL
      const cy = y / SAND_CELL
      paintSand(stateRef.current.sand, cx, cy, SAND_BRUSH_RADIUS_CELLS)
      dragRef.current = { kind: 'paint' }
      queueSave()
    } else if (tool === 'erase') {
      const cx = x / SAND_CELL
      const cy = y / SAND_CELL
      eraseSand(stateRef.current.sand, cx, cy, ERASE_BRUSH_RADIUS_CELLS)
      // Also remove decor under pointer
      stateRef.current.decor = stateRef.current.decor.filter((d) => {
        const meta = getDecor(d.decorId)
        if (!meta) return false
        const inside = x >= d.x && x <= d.x + meta.width && y >= d.y && y <= d.y + meta.height
        return !inside
      })
      syncCounts()
      dragRef.current = { kind: 'erase' }
      queueSave()
    }
  }, [tool, queueSave, syncCounts])

  const onPointerMoveCanvas = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return
    const { x, y } = canvasToLogical(e.currentTarget, e.clientX, e.clientY)
    if (dragRef.current.kind === 'paint') {
      paintSand(stateRef.current.sand, x / SAND_CELL, y / SAND_CELL, SAND_BRUSH_RADIUS_CELLS)
      queueSave()
    } else if (dragRef.current.kind === 'erase') {
      eraseSand(stateRef.current.sand, x / SAND_CELL, y / SAND_CELL, ERASE_BRUSH_RADIUS_CELLS)
      queueSave()
    }
  }, [queueSave])

  const onPointerUpCanvas = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }, [])

  // Decor drag-from-tray
  const onTrayPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, decorId: string) => {
    e.preventDefault()
    setDraggingDecor(decorId)
    setGhost({ id: decorId, x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!draggingDecor) return
    const onMove = (ev: PointerEvent) => {
      setGhost({ id: draggingDecor, x: ev.clientX, y: ev.clientY })
    }
    const onUp = (ev: PointerEvent) => {
      setDraggingDecor(null)
      setGhost(null)
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom) return
      const { x, y } = canvasToLogical(canvas, ev.clientX, ev.clientY)
      const meta = getDecor(draggingDecor)
      if (!meta) return
      const placed: DecorInstance = {
        instanceId: newInstanceId('decor'),
        decorId: draggingDecor,
        x: Math.max(0, Math.min(TANK_W - meta.width, x - meta.width / 2)),
        y: Math.max(0, Math.min(TANK_H - meta.height, y - meta.height / 2)),
      }
      stateRef.current.decor.push(placed)
      queueSave()
      syncCounts()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [draggingDecor, queueSave, syncCounts])

  return (
    <div className="aquarium-body">
      {closeButton}
      <header className="aquarium-readout" aria-label="Aquarium status">
        <div className="aquarium-readout__heading">
          <span className="aquarium-readout__chip">▌ AQUARIUM</span>
          <span className="aquarium-readout__title" data-text="Build your tank">Build your tank</span>
        </div>
        <div className="aquarium-readout__counts">
          <span>Fish: {counts.fish}</span>
          <span aria-hidden="true">·</span>
          <span>Decor: {counts.decor}</span>
        </div>
      </header>

      <section className="aquarium-stage" aria-label="Aquarium tank">
        <div className="aquarium-tank-frame">
          <canvas
            ref={canvasRef}
            className="aquarium-canvas"
            width={TANK_W}
            height={TANK_H}
            onPointerDown={onPointerDownCanvas}
            onPointerMove={onPointerMoveCanvas}
            onPointerUp={onPointerUpCanvas}
            onPointerCancel={onPointerUpCanvas}
            data-tool={tool}
            data-interactive
          />
          {!imagesReady && <div className="aquarium-loading">Loading…</div>}
        </div>

        <div className="aquarium-tools" role="toolbar" aria-label="Aquarium tools">
          <button
            type="button"
            className={`aquarium-tool ${tool === 'sand' ? 'aquarium-tool--active' : ''}`}
            onClick={() => setTool('sand')}
            data-interactive
          >
            Sand
          </button>
          <button
            type="button"
            className={`aquarium-tool ${tool === 'erase' ? 'aquarium-tool--active' : ''}`}
            onClick={() => setTool('erase')}
            data-interactive
          >
            Eraser
          </button>
          <button
            type="button"
            className="aquarium-tool aquarium-tool--accent"
            onClick={handleAddFish}
            data-interactive
          >
            + Fish
          </button>
          <button
            type="button"
            className="aquarium-tool aquarium-tool--danger"
            onClick={handleReset}
            data-interactive
          >
            Reset
          </button>
        </div>

        <div className="aquarium-tray" aria-label="Decor">
          {DECOR_CATALOG.map((d) => (
            <button
              key={d.id}
              type="button"
              className="aquarium-tray__item"
              onPointerDown={(e) => onTrayPointerDown(e, d.id)}
              aria-label={`Drag ${d.label} into tank`}
              data-interactive
            >
              <img src={d.src} alt="" draggable={false} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </section>

      {ghost && (
        <img
          className="aquarium-ghost"
          src={`/textures/aquarium/decor/${ghost.id}.png`}
          alt=""
          draggable={false}
          style={{ left: ghost.x, top: ghost.y }}
        />
      )}
    </div>
  )
}
