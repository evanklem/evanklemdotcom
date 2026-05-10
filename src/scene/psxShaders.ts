// PSX clay material — applied to the vase and the 4 inner models.
//
// Vertex: snap clip-space xy to integer pixel buckets (vertex jitter).
// Fragment: sample the model's diffuse map (if any), convert to luminance,
// recolor with uTint (preserves crack/shadow detail while making the model
// truly vibrant pink/lime/indigo/orange/yellow). Lambert per-vertex normal,
// 4x4 Bayer dither, 14-level palette quantize for authentic PSX banding.
//
// Three.js auto-injects position/normal/uv attributes + matrix uniforms
// in GLSL3 ShaderMaterial mode.

export const psxVert = /* glsl */ `
uniform float uSnapFactor;
uniform vec2 uViewportSize;

out vec3 vNormalView;
out vec2 vUv;

void main() {
  vUv = uv;
  vNormalView = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vec4 clipPos = projectionMatrix * mvPos;

  // PSX vertex snap.
  vec2 ndc = clipPos.xy / clipPos.w;
  vec2 pixel = ndc * 0.5 * uViewportSize;
  vec2 snapped = floor(pixel * uSnapFactor) / uSnapFactor;
  clipPos.xy = (snapped / (0.5 * uViewportSize)) * clipPos.w;

  gl_Position = clipPos;
}
`

export const psxFrag = /* glsl */ `
precision highp float;

in vec3 vNormalView;
in vec2 vUv;

out vec4 fragColor;

uniform sampler2D uMap;
uniform float uHasMap;
uniform vec3 uTint;
uniform vec3 uLightDir;
uniform float uOpacity;
uniform float uBrightnessFloor;
uniform float uDitherStrength;

const float bayer[16] = float[16](
   0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
  12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
   3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
  15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

void main() {
  // Desaturate the tint slightly so darks and lights don't both render at
  // full chroma — pure saturated tint everywhere reads as a flat candy
  // coating and kills perceived shading. 15% pull toward luminance keeps
  // the color identity but restores some tonal range.
  float tintLum = dot(uTint, vec3(0.299, 0.587, 0.114));
  vec3 tint = mix(vec3(tintLum), uTint, 0.85);

  vec3 albedo = tint;
  if (uHasMap > 0.5) {
    vec4 sampled = texture(uMap, vUv);
    float lum = dot(sampled.rgb, vec3(0.299, 0.587, 0.114));
    float brightness = uBrightnessFloor + (1.0 - uBrightnessFloor) * lum;
    albedo = tint * brightness;
  }

  // Lifted ambient floor so back-facing geometry doesn't read as flat black
  // — keeps the PSX banding silhouette but brightens the overall read.
  vec3 N = normalize(vNormalView);
  float lambert = max(dot(N, normalize(uLightDir)), 0.0);
  vec3 lit = albedo * (0.30 + 0.95 * lambert);

  // 4x4 Bayer dither indexed by screen-space fragment position. At low DPR
  // these screen coords map to the chunky on-screen pixels we want.
  vec2 sp = floor(gl_FragCoord.xy);
  int bx = int(mod(sp.x, 4.0));
  int by = int(mod(sp.y, 4.0));
  float ditherT = bayer[by * 4 + bx];
  lit += (ditherT - 0.5) * (1.0 / 12.0) * uDitherStrength;

  // Screen-door opacity avoids expensive blended transparency on high-poly
  // models and keeps fades in the same dithered visual language.
  if (uOpacity <= 0.0 || (uOpacity < 0.999 && ditherT > uOpacity)) {
    discard;
  }

  // 14-level quantize per channel — the visible color banding.
  lit = floor(clamp(lit, 0.0, 1.0) * 13.0 + 0.5) / 13.0;

  fragColor = vec4(lit, 1.0);
}
`
