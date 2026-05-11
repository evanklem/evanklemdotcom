import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Vase } from './Vase'
import { InnerModel } from './InnerModel'
import { REGIONS } from './regions'
import { psxRegistry } from './psxMaterial'

// Push viewport size to PSX materials only when the canvas size changes.
function ViewportSync() {
  const { size } = useThree()
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      psxRegistry.setViewport(size.width, size.height)
    }
  }, [size.width, size.height])
  return null
}

// Force GPU shader compile/link before the first navigation. Without this, the
// PSX shader programs only compile the moment a previously-invisible InnerModel
// becomes visible — a 50–300ms stall that reads as the "lag when the model
// comes out of the vase."
function ShaderWarmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    const id = window.setTimeout(() => {
      const visibility = new Map()
      scene.traverse((obj) => {
        visibility.set(obj, obj.visible)
        obj.visible = true
      })
      gl.compile(scene, camera)
      scene.traverse((obj) => {
        obj.visible = visibility.get(obj) ?? obj.visible
      })
    }, 650)
    return () => window.clearTimeout(id)
  }, [gl, scene, camera])
  return null
}

// Low DPR is the PSX/CRT trick: render at sub-native resolution and let the
// browser's default bilinear upscale do the soft-pixel look. Also a huge perf
// win on mobile. AdaptiveDpr can drop further on weak devices.
interface SceneProps {
  onVaseReady?: () => void
}

export function Scene({ onVaseReady }: SceneProps) {
  return (
    <Canvas
      dpr={[0.45, 0.6]}
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{ alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      performance={{ min: 0.25 }}
    >
      <AdaptiveDpr />
      <AdaptiveEvents />
      <ViewportSync />
      <Suspense fallback={null}>
        <Vase onReady={onVaseReady} />
        {REGIONS.map((r) => (
          <InnerModel
            key={r.id}
            id={r.id}
            tint={r.accentColor}
            modelPath={`/models/${r.id}.opt.glb`}
          />
        ))}
        <ShaderWarmup />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.6}
          mipmapBlur
          resolutionScale={0.85}
        />
      </EffectComposer>
    </Canvas>
  )
}
