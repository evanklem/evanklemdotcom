import { useEffect, useMemo, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useDrag } from '@use-gesture/react'
import { Box3, Group, Mesh, MeshStandardMaterial, ShaderMaterial, type Texture, Vector3 } from 'three'
import type { GLTF } from 'three-stdlib'
import { useNavState } from './navContext'
import { createPsxMaterial, psxRegistry } from './psxMaterial'
import { getSceneHalfHeight, getSceneHalfWidth, isCompactScene } from './layout'
import type { SectionId } from './types'

const MODEL_TARGET_SIZE = 1.85
const STORED_Y = -0.62
const VISIBLE_Y = 0.04
const COMPACT_HIDE_Y = -0.08
const STORED_SCALE = 0.12
const COMPACT_HIDE_SCALE = 0.36
const VISIBLE_SCALE = 1.0
const DESKTOP_REVEAL_DELAY_MS = 80
const COMPACT_REVEAL_DELAY_MS = 0
const IDLE_X_DESKTOP = -0.66
const ACTIVE_X_DESKTOP = -1.72
const ACTIVE_Y_COMPACT = 0.82
const POS_LERP_TAU = 0.18
const DESKTOP_PANEL_LEFT_NDC = -0.2
const DESKTOP_EXPOSED_CENTER_NDC = -0.6
const DESKTOP_FRAME_MARGIN = 0.08
const DESKTOP_MIN_VISIBLE_SCALE = 0.44

const PER_SECTION_SCALE: Record<SectionId, number> = {
  about: 0.88,
  projects: 1.06,
  art: 1.0,
  aquarium: 0.78,
}

const ORIGINAL_MODEL_BOUNDS: Record<SectionId, { max: number; center: Vector3 }> = {
  about: { max: 0.0844, center: new Vector3(-0.1897, 0.043, 0.0002) },
  projects: { max: 0.2055, center: new Vector3(0.0009, -0.0028, 0.0024) },
  art: { max: 1.8126, center: new Vector3(0.0078, 0.5595, -0.0479) },
  aquarium: { max: 0.0627, center: new Vector3(-0.0024, -0.0005, -0.0009) },
}

interface ModelGltf extends GLTF {
  scene: Group
}

interface Props {
  id: SectionId
  tint: string
  modelPath: string
}

export function InnerModel({ id, tint, modelPath }: Props) {
  const { activeRegion } = useNavState()
  const { size } = useThree()
  const outerGroupRef = useRef<Group>(null)
  const spinningGroupRef = useRef<Group>(null)
  const gltf = useGLTF(modelPath) as ModelGltf
  const materialRefs = useRef<ShaderMaterial[]>([])

  const isActive = activeRegion === id

  useEffect(() => {
    const materials: ShaderMaterial[] = []
    gltf.scene.traverse((obj) => {
      const m = obj as Mesh
      if (!m.isMesh) return
      // Cache the original diffuse map on first apply. On a subsequent run
      // `m.material` would be the previous PSX ShaderMaterial (no `.map`
      // accessor), and we'd silently lose the texture.
      let origMap = m.userData.__psxOrigMap as Texture | null | undefined
      if (origMap === undefined) {
        const existing = m.material as MeshStandardMaterial | undefined
        origMap = (existing && 'map' in existing && existing.map) || null
        m.userData.__psxOrigMap = origMap
      }
      const psx = createPsxMaterial({
        map: origMap,
        tint,
        opacity: 0,
        brightnessFloor: 0.36,
        ditherStrength: 1.0,
      })
      m.material = psx
      m.castShadow = false
      m.receiveShadow = false
      materials.push(psx)
    })
    materialRefs.current = materials
    return () => {
      for (const mat of materials) {
        mat.dispose()
        psxRegistry.remove(mat)
      }
      materialRefs.current = []
    }
  }, [gltf.scene, id, tint])

  const { fitScale, fitOffset } = useMemo(() => {
    const originalBounds = ORIGINAL_MODEL_BOUNDS[id]
    const box = originalBounds ? null : new Box3().setFromObject(gltf.scene)
    const sz = new Vector3()
    box?.getSize(sz)
    const max = originalBounds?.max ?? Math.max(sz.x, sz.y, sz.z)
    const adjust = PER_SECTION_SCALE[id] ?? 1
    const scale = max > 0 ? (MODEL_TARGET_SIZE * adjust) / max : 1
    const center = originalBounds?.center ?? new Vector3()
    box?.getCenter(center)
    return {
      fitScale: scale,
      fitOffset: new Vector3(-center.x * scale, -center.y * scale, -center.z * scale),
    }
  }, [gltf.scene, id])

  // Compact active-state lifts the model into the visible strip above the
  // bottom panel without pinning it to the top edge.
  const compactTarget = isCompactScene(size.width)
  const visibleY = compactTarget ? ACTIVE_Y_COMPACT : VISIBLE_Y
  const activeResizeKey = isActive ? `${size.width}x${size.height}` : 'inactive'

  const [{ y, scale, opacity }, api] = useSpring(() => ({
    y: STORED_Y,
    scale: STORED_SCALE,
    opacity: 0,
    config: { mass: 1, tension: 130, friction: 22 },
  }))

  useEffect(() => {
    api.stop(true)

    if (isActive) {
      const compact = compactTarget
      api.start({
        to: {
          y: visibleY,
          scale: VISIBLE_SCALE,
          opacity: 1,
        },
        delay: compact ? COMPACT_REVEAL_DELAY_MS : DESKTOP_REVEAL_DELAY_MS,
        config: compact
          ? { mass: 0.8, tension: 190, friction: 24 }
          : { mass: 1, tension: 118, friction: 24 },
      })
      return
    }

    if (compactTarget) {
      api.start({
        to: [
          {
            y: COMPACT_HIDE_Y,
            scale: COMPACT_HIDE_SCALE,
            opacity: 0,
            config: { mass: 0.8, tension: 250, friction: 24 },
          },
          {
            y: STORED_Y,
            scale: STORED_SCALE,
            opacity: 0,
            config: { duration: 1 },
          },
        ],
      })
      return
    }

    api.start({
      to: [
        {
          y: STORED_Y,
          scale: STORED_SCALE,
          opacity: 0,
          config: { mass: 1, tension: 120, friction: 24 },
        },
      ],
    })
  }, [activeResizeKey, api, isActive, visibleY])

  const userRotRef = useRef(0)
  const dragStartRotRef = useRef(0)
  const draggingRef = useRef(false)
  // Lerped to the same coupled target as the vase so model + vase track as
  // one unit when sliding into the open left zone.
  const posXRef = useRef(0)
  const bind = useDrag(({ first, last, movement: [mx], event }) => {
    if (!isActive) return
    if (event && 'stopPropagation' in event) event.stopPropagation()
    if (first) {
      draggingRef.current = true
      dragStartRotRef.current = userRotRef.current
    }
    userRotRef.current = dragStartRotRef.current + (mx / size.width) * Math.PI * 2
    if (last) draggingRef.current = false
  })

  useEffect(() => {
    if (!isActive) userRotRef.current = 0
  }, [isActive])

  useFrame((_, delta) => {
    // Skip the entire per-frame body when this model is fully off-screen.
    // While inactive AND opacity ≤ 0.01 the mesh has visible=false and the
    // scale/position math has no observable effect — but still ran 60fps
    // across all 4 InnerModel instances. Material uniform updates also can
    // wait until the model is about to become visible.
    const op = opacity.get()
    if (!isActive && op < 0.01) return

    // Layout-aware target: desktop pushes deep into the open left zone when
    // active so the model centers in the gap formed by the right-side panel.
    // Compact layouts center horizontally and lift via the y-spring above.
    const compact = isCompactScene(size.width)
    const sectionScale = PER_SECTION_SCALE[id] ?? 1
    const visibleRadius = (MODEL_TARGET_SIZE * sectionScale) / 2
    const halfFrameWidth = getSceneHalfWidth(size.width, size.height)
    const halfFrameHeight = getSceneHalfHeight()
    const verticalScale = (halfFrameHeight - DESKTOP_FRAME_MARGIN) / visibleRadius
    const horizontalScale = ((halfFrameWidth * 0.4) - DESKTOP_FRAME_MARGIN) / visibleRadius
    const desktopScale = Math.min(
      1,
      Math.max(DESKTOP_MIN_VISIBLE_SCALE, Math.min(horizontalScale, verticalScale)),
    )
    const baseScale = compact ? isActive ? 0.52 : 0.62 : isActive ? desktopScale : 1.0
    const frameRadius = visibleRadius * baseScale
    const leftLimit = -halfFrameWidth + frameRadius + DESKTOP_FRAME_MARGIN
    const rightLimit = (halfFrameWidth * DESKTOP_PANEL_LEFT_NDC) - frameRadius - DESKTOP_FRAME_MARGIN
    const exposedCenterX = halfFrameWidth * DESKTOP_EXPOSED_CENTER_NDC
    const preferredX = Math.min(ACTIVE_X_DESKTOP, exposedCenterX)
    const activeDesktopX = leftLimit <= rightLimit
      ? Math.min(Math.max(preferredX, leftLimit), rightLimit)
      : (leftLimit + rightLimit) / 2
    const targetX = compact ? 0 : isActive ? activeDesktopX : IDLE_X_DESKTOP
    const k = 1 - Math.exp(-delta / POS_LERP_TAU)
    posXRef.current += (targetX - posXRef.current) * k

    if (outerGroupRef.current) {
      outerGroupRef.current.position.x = posXRef.current
      outerGroupRef.current.scale.setScalar(baseScale)
    }

    for (const mat of materialRefs.current) {
      mat.uniforms.uOpacity.value = op
    }
    if (spinningGroupRef.current && isActive) {
      if (!draggingRef.current) {
        userRotRef.current += delta * 0.35
      }
      spinningGroupRef.current.rotation.y = userRotRef.current
    }
  })

  return (
    <animated.group
      ref={outerGroupRef}
      position-y={y}
      visible={opacity.to((o) => o > 0.01)}
      {...bind()}
    >
      <animated.group ref={spinningGroupRef} scale={scale}>
        <group scale={fitScale} position={fitOffset}>
          <primitive object={gltf.scene} />
        </group>
      </animated.group>
    </animated.group>
  )
}

useGLTF.preload('/models/about.opt.glb')
useGLTF.preload('/models/projects.opt.glb')
useGLTF.preload('/models/art.opt.glb')
