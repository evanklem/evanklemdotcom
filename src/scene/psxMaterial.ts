import {
  Color,
  GLSL3,
  NearestFilter,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Texture,
} from 'three'
import { psxFrag, psxVert } from './psxShaders'

export interface PsxMaterialOpts {
  /** Diffuse texture from the imported glTF, if any. */
  map?: Texture | null
  /** Vibrant hue tint (CSS hex or three Color). Detail-preserving recolor. */
  tint: Color | string | number
  /** Initial opacity. Animate via material.uniforms.uOpacity.value. */
  opacity?: number
  /** Floor for luminance remap; 0 = pure tint at black areas, 1 = no remap. */
  brightnessFloor?: number
  /** Screen-space Bayer dither intensity. */
  ditherStrength?: number
}

const SNAP_FACTOR = 0.5

/**
 * Build a PSX-style ShaderMaterial. One material per mesh — uniforms can be
 * mutated independently. Caller is responsible for updating uViewportSize on
 * resize via the shared `psxRegistry`.
 */
export function createPsxMaterial(opts: PsxMaterialOpts): ShaderMaterial {
  const tex = opts.map ?? null
  if (tex) {
    tex.minFilter = NearestFilter
    tex.magFilter = NearestFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true
  }
  const tintColor = opts.tint instanceof Color ? opts.tint : new Color(opts.tint)

  const mat = new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: psxVert,
    fragmentShader: psxFrag,
    uniforms: {
      uMap: { value: tex },
      uHasMap: { value: tex ? 1.0 : 0.0 },
      uTint: { value: new Vector3(tintColor.r, tintColor.g, tintColor.b) },
      uSnapFactor: { value: SNAP_FACTOR },
      uViewportSize: { value: new Vector2(1, 1) },
      uLightDir: { value: new Vector3(0.5, 0.75, 0.6).normalize() },
      uOpacity: { value: opts.opacity ?? 1.0 },
      uBrightnessFloor: { value: opts.brightnessFloor ?? 0.25 },
      uDitherStrength: { value: opts.ditherStrength ?? 1.0 },
    },
    transparent: false,
    depthWrite: true,
  })
  psxRegistry.add(mat)
  return mat
}

// All PSX materials register here so a single useFrame updates uViewportSize
// when the canvas resizes.
class PsxRegistry {
  private materials = new Set<ShaderMaterial>()
  add(m: ShaderMaterial) { this.materials.add(m) }
  remove(m: ShaderMaterial) { this.materials.delete(m) }
  setViewport(width: number, height: number) {
    for (const m of this.materials) {
      const v = m.uniforms.uViewportSize.value as Vector2
      if (v.x !== width || v.y !== height) v.set(width, height)
    }
  }
}

export const psxRegistry = new PsxRegistry()
