import { Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Vase } from './Vase'
import { InnerModel } from './InnerModel'
import { REGIONS } from './regions'
import { psxRegistry } from './psxMaterial'

// Push viewport size to PSX materials. Runs once per frame in a single place
// instead of from every Vase + InnerModel useFrame. We use useFrame (not
// useEffect) because fiber's `size` starts at (0, 0) before the canvas is
// measured, and a (0, 0) viewport makes the vertex-snap shader divide by zero
// → invisible meshes until the next resize.
function ViewportSync() {
  const { size } = useThree()
  useFrame(() => {
    psxRegistry.setViewport(size.width, size.height)
  })
  return null
}

// Force GPU shader compile/link before the first navigation. Without this, the
// PSX shader programs only compile the moment a previously-invisible InnerModel
// becomes visible — a 50–300ms stall that reads as the "lag when the model
// comes out of the vase."
function ShaderWarmup() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      gl.compile(scene, camera)
    })
    return () => cancelAnimationFrame(id)
  }, [gl, scene, camera])
  return null
}

// Low DPR is the PSX/CRT trick: render at sub-native resolution and let the
// browser's default bilinear upscale do the soft-pixel look. Also a huge perf
// win on mobile. AdaptiveDpr can drop further on weak devices.
export function Scene() {
  return (
    <Canvas
      dpr={[0.45, 0.6]}
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{ alpha: true, premultipliedAlpha: false }}
      style={{ background: 'transparent' }}
    >
      <AdaptiveDpr />
      <AdaptiveEvents />
      <ViewportSync />
      <Suspense fallback={null}>
        <Vase />
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
