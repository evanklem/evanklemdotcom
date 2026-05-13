/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei/core/Gltf.js'
import { useDrag } from '@use-gesture/react'
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
  type Texture,
  Vector3,
} from 'three'
import type { GLTF } from 'three-stdlib'
import { useNavState } from './navContext'
import { createPsxMaterial, psxRegistry } from './psxMaterial'
import { lerpColorThroughCycle } from './colorCycle'
import { REGIONS } from './regions'
import { isCompactScene } from './layout'

const VASE_PATH = '/models/defaultvase.opt.glb'
const TARGET_SIZE = 2.4
const ORIGINAL_BOUNDS_MAX = 0.2414
const ORIGINAL_BOUNDS_CENTER = new Vector3(-0.0025, 0.0366, -0.0038)
const OPEN_OFFSET = 0.95
const ACTIVE_X_DESKTOP = -1.72
const IDLE_X_DESKTOP = -0.66
const ACTIVE_Y_COMPACT = 0.58
const VASE_FADE_DELAY_S = 0.34
const VASE_FADE_CUTOFF_S = 0.78
const COMPACT_VASE_FADE_DELAY_S = 0.24
const COMPACT_VASE_FADE_CUTOFF_S = 0.68
const VASE_FADE_RATE = 0.32
// 24s across 6 ping-pong keyframes ≈ same per-step pace as old 18s/4-step.
const COLOR_CYCLE_PERIOD_S = 24
const AUTO_SPIN_RATE = 0.18
const OPEN_LERP_TAU = 0.18 // snappy open
const HALF_AT_REST_EPS = 0.0001
const CSS_COLOR_UPDATE_MIN_WIDTH = 1181

// Per-region accent colors precomputed once instead of allocated per frame.
const REGION_COLORS = new Map<string, Color>(
  REGIONS.map((r) => [r.id, new Color(r.accentColor)] as const),
)
const FALLBACK_REGION_COLOR = new Color(REGIONS[0].accentColor)

// Module-level scratches reused across frames to avoid GC pressure in the
// useFrame hot path.
const _parentScale = new Vector3()
const _targetColor = new Color()

interface VaseGltf extends GLTF {
  scene: Group
}

useGLTF.preload(VASE_PATH)

function applyPsxMaterials(root: Object3D, tint: string): ShaderMaterial[] {
  const mats: ShaderMaterial[] = []
  root.traverse((obj) => {
    const m = obj as Mesh
    if (!m.isMesh) return
    // Cache the original diffuse map on first apply. Without this, a re-run
    // would read the previous PSX ShaderMaterial as `existing` (no `.map`
    // accessor) and silently drop the texture.
    let origMap = m.userData.__psxOrigMap as Texture | null | undefined
    if (origMap === undefined) {
      const existing = m.material as MeshStandardMaterial | undefined
      origMap = (existing && 'map' in existing && existing.map) || null
      m.userData.__psxOrigMap = origMap
    }
    const psx = createPsxMaterial({ map: origMap, tint, brightnessFloor: 0.36 })
    m.material = psx
    m.castShadow = false
    m.receiveShadow = false
    mats.push(psx)
  })
  return mats
}

function findHalves(scene: Group): { top: Object3D | null; bottom: Object3D | null } {
  const candidates: Object3D[] = []
  scene.traverse((obj) => {
    if (/^LowPoly/.test(obj.name) && obj.children.length > 0) {
      if (!candidates.some((c) => c === obj.parent)) candidates.push(obj)
    }
  })
  // The optimized vase keeps the upper half under LowPoly_2 but flattens the
  // lower half into a scene-level mesh. Include that mesh so open/close still
  // animates both physical halves.
  for (const child of scene.children) {
    const m = child as Mesh
    if (m.isMesh && !candidates.includes(m)) candidates.push(m)
  }
  if (candidates.length < 2) return { top: null, bottom: null }
  const a = candidates[0]
  const b = candidates[1]
  const ay = new Box3().setFromObject(a).getCenter(new Vector3()).y
  const by = new Box3().setFromObject(b).getCenter(new Vector3()).y
  return ay >= by ? { top: a, bottom: b } : { top: b, bottom: a }
}

interface VaseProps {
  onReady?: () => void
}

export function Vase({ onReady }: VaseProps) {
  const groupRef = useRef<Group>(null)
  const { activeRegion } = useNavState()
  const { size } = useThree()
  const gltf = useGLTF(VASE_PATH) as VaseGltf

  useEffect(() => {
    onReady?.()
  }, [onReady])

  const matsRef = useRef<ShaderMaterial[]>([])
  useEffect(() => {
    matsRef.current = applyPsxMaterials(gltf.scene, '#ffffff')
    return () => {
      for (const mat of matsRef.current) {
        mat.dispose()
        psxRegistry.remove(mat)
      }
      matsRef.current = []
    }
  }, [gltf.scene])

  const { fitScale, fitOffset } = useMemo(() => {
    // Fit against the original GLB bounds. The optimized GLB is flattened and
    // has a slightly different bounding box, but the intended on-screen scale
    // and placement should remain identical.
    const scale = TARGET_SIZE / ORIGINAL_BOUNDS_MAX
    return {
      fitScale: scale,
      fitOffset: new Vector3(
        -ORIGINAL_BOUNDS_CENTER.x * scale,
        -ORIGINAL_BOUNDS_CENTER.y * scale,
        -ORIGINAL_BOUNDS_CENTER.z * scale,
      ),
    }
  }, [])

  const { top: topPart, bottom: bottomPart, topInitY, bottomInitY } = useMemo(() => {
    const halves = findHalves(gltf.scene)
    return {
      ...halves,
      topInitY: halves.top?.position.y ?? 0,
      bottomInitY: halves.bottom?.position.y ?? 0,
    }
  }, [gltf.scene])

  const topYRef = useRef(0)
  const bottomYRef = useRef(0)
  const topYTargetRef = useRef(0)
  const bottomYTargetRef = useRef(0)
  useEffect(() => {
    topYTargetRef.current = activeRegion ? OPEN_OFFSET : 0
    bottomYTargetRef.current = activeRegion ? -OPEN_OFFSET * 0.4 : 0
  }, [activeRegion])

  // Smooth-lerped group position (slides left on desktop / up on compact
  // when a section opens, so the panel can slide in from the right without
  // overlapping the vase).
  const initialCompact = isCompactScene(size.width)
  const posXRef = useRef(initialCompact ? 0 : IDLE_X_DESKTOP)
  const posYRef = useRef(0)

  const rotationRef = useRef(0)
  const startRotRef = useRef(0)
  const draggingRef = useRef(false)
  const [dragBound, setDragBound] = useState(false)
  const bind = useDrag(({ first, last, movement: [mx], event }) => {
    if (event && 'stopPropagation' in event) event.stopPropagation()
    if (first) {
      draggingRef.current = true
      startRotRef.current = rotationRef.current
    }
    rotationRef.current = startRotRef.current + (mx / size.width) * Math.PI * 2
    if (last) draggingRef.current = false
  })
  useEffect(() => {
    if (!dragBound) setDragBound(true)
  }, [dragBound])

  const timeRef = useRef(0)
  const opacityRef = useRef(1)
  const activeSinceRef = useRef<number | null>(null)
  // Track last quantized CSS-var color so we only write to the DOM when the
  // visible color actually changed (cuts a per-frame style invalidation that
  // cascaded through the 2800-line panel stylesheet).
  const lastCssRef = useRef({ r: -1, g: -1, b: -1, t: -1 })

  useFrame((_, delta) => {
    timeRef.current += delta

    // Compute responsive base scale. Compact uses the same explicit width
    // breakpoint as the DOM overlays so in-between widths don't collide.
    // Active state shrinks the desktop vase slightly so it doesn't clip the
    // camera frustum after sliding left.
    const compact = isCompactScene(size.width)
    const active = !!activeRegion
    if (active && activeSinceRef.current == null) activeSinceRef.current = timeRef.current
    if (!active) activeSinceRef.current = null

    const baseScale = active
      ? compact ? 0.54 : 0.76
      : compact ? 0.65 : 1.0
    const breath = !activeRegion
      ? 1 + Math.sin(timeRef.current * 0.9) * 0.014
      : 1

    // Active: slide hard left (desktop) so the section panel sliding in from
    // the right has clear space, OR push up (compact) so the bottom panel
    // doesn't cover the vase. Idle: original positions.
    const targetX = active
      ? compact ? 0 : ACTIVE_X_DESKTOP
      : compact ? 0 : IDLE_X_DESKTOP
    const targetY = compact && active ? ACTIVE_Y_COMPACT : 0
    const k = 1 - Math.exp(-delta / OPEN_LERP_TAU)
    posXRef.current += (targetX - posXRef.current) * k
    posYRef.current += (targetY - posYRef.current) * k

    if (groupRef.current) {
      if (!draggingRef.current && !activeRegion) {
        rotationRef.current += AUTO_SPIN_RATE * delta
      }
      groupRef.current.rotation.y = rotationRef.current
      groupRef.current.scale.setScalar(baseScale * breath)
      groupRef.current.position.x = posXRef.current
      groupRef.current.position.y = posYRef.current
    }

    // Lerp top/bottom toward target (same tau as group slide).
    topYRef.current += (topYTargetRef.current - topYRef.current) * k
    bottomYRef.current += (bottomYTargetRef.current - bottomYRef.current) * k

    // Convert WORLD-space delta to LOCAL-space delta by dividing by the
    // parent's cumulative world scale. Skip the matrix walk + getWorldScale
    // when both halves are at rest at the closed position — the most common
    // idle state.
    const topMoving =
      Math.abs(topYTargetRef.current - topYRef.current) > HALF_AT_REST_EPS ||
      Math.abs(topYRef.current) > HALF_AT_REST_EPS
    const bottomMoving =
      Math.abs(bottomYTargetRef.current - bottomYRef.current) > HALF_AT_REST_EPS ||
      Math.abs(bottomYRef.current) > HALF_AT_REST_EPS
    if (topPart && topMoving) {
      topPart.parent?.updateMatrixWorld()
      topPart.parent?.getWorldScale(_parentScale)
      const inv = _parentScale.y > 0 ? 1 / _parentScale.y : 1
      topPart.position.y = topInitY + topYRef.current * inv
    }
    if (bottomPart && bottomMoving) {
      bottomPart.parent?.updateMatrixWorld()
      bottomPart.parent?.getWorldScale(_parentScale)
      const inv = _parentScale.y > 0 ? 1 / _parentScale.y : 1
      bottomPart.position.y = bottomInitY + bottomYRef.current * inv
    }

    if (activeRegion) {
      const c = REGION_COLORS.get(activeRegion) ?? FALLBACK_REGION_COLOR
      _targetColor.copy(c)
    } else {
      const cycleT = (timeRef.current % COLOR_CYCLE_PERIOD_S) / COLOR_CYCLE_PERIOD_S
      lerpColorThroughCycle(cycleT, _targetColor)
    }
    for (const mat of matsRef.current) {
      const tintU = mat.uniforms.uTint.value as Vector3
      tintU.x += (_targetColor.r - tintU.x) * 0.06
      tintU.y += (_targetColor.g - tintU.y) * 0.06
      tintU.z += (_targetColor.b - tintU.z) * 0.06
    }
    const currentTint = matsRef.current[0]?.uniforms.uTint.value as Vector3 | undefined
    // The cycling CSS color only drives the desktop logo. On compact/tablet
    // touch layouts, root writes force mobile WebViews to restyle masked UI
    // over the constantly repainting WebGL layer.
    if (currentTint && size.width >= CSS_COLOR_UPDATE_MIN_WIDTH) {
      const r = Math.round(currentTint.x * 255)
      const g = Math.round(currentTint.y * 255)
      const b = Math.round(currentTint.z * 255)
      const last = lastCssRef.current
      const cssUpdateDue = last.t < 0 || timeRef.current - last.t > 0.08
      const colorChanged =
        Math.abs(r - last.r) > 1 ||
        Math.abs(g - last.g) > 1 ||
        Math.abs(b - last.b) > 1
      if (cssUpdateDue && colorChanged) {
        document.documentElement.style.setProperty(
          '--vase-cycle-color',
          `rgb(${r} ${g} ${b})`,
        )
        last.r = r
        last.g = g
        last.b = b
        last.t = timeRef.current
      }
    }

    const activeElapsed = activeSinceRef.current == null ? 0 : timeRef.current - activeSinceRef.current
    const fadeDelay = compact ? COMPACT_VASE_FADE_DELAY_S : VASE_FADE_DELAY_S
    const fadeCutoff = compact ? COMPACT_VASE_FADE_CUTOFF_S : VASE_FADE_CUTOFF_S
    const targetOp = active && activeElapsed > fadeDelay ? 0 : 1
    opacityRef.current += (targetOp - opacityRef.current) * VASE_FADE_RATE
    if (active && activeElapsed > fadeCutoff) opacityRef.current = 0
    const op = opacityRef.current
    for (const mat of matsRef.current) {
      mat.uniforms.uOpacity.value = op
      mat.visible = op > 0.02
    }
  })

  // Position + scale are fully driven by useFrame to avoid JSX/useFrame
  // conflicts (which were causing the vase to snap-shrink each frame).
  return (
    <group ref={groupRef} {...bind()}>
      <group scale={fitScale} position={fitOffset}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  )
}
