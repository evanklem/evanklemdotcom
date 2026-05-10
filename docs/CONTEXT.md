# Glossary — surf

Domain terms used across the codebase. Keep these consistent in identifiers, comments, prose, and chat.

## Region

One of the 4 sections mapped to a quadrant of the navigation sphere: `about`, `projects`, `art`, `oracle`. Defined in `src/scene/regions.ts`. Each Region has:

- `id` — `SectionId` literal (`'about' | 'projects' | 'art' | 'oracle'`)
- `objectAngle` — radians, in [0, 2π); the object-space angle (`atan2(x, z)`) where this region's face is drawn on the sphere. The mesh rotation that centers it toward the camera is `-objectAngle`.
- `accentColor` — hex string used for the orbital tile glow and section panel border when active
- `materialId` — which fragment-shader vibe this region renders in (`'chrome' | 'wireframe' | 'iridescent' | 'halftone'`)

## Face

The visual "look" of a region drawn on the sphere's surface. Each region has its own face texture in `public/textures/faces/<id>.png` composited on top of its material vibe. Face textures are placeholders for now; replaced as art lands.

## Material vibe

The fragment-shader recipe for a region's surface aesthetic, picked from references:

- **chrome** (ABOUT) — Y2K chartreuse liquid glass with VHS scanlines
- **wireframe** (PROJECTS) — emissive grid lines on near-black, slow pulse
- **iridescent** (ART) — fresnel-driven rainbow hue shift
- **halftone** (ORACLE) — cyan dot-matrix on black

Defined in `src/scene/sphereShaders.ts`. Region → vibe is fixed; never display ART's vibe under the ORACLE face, etc.

## Tile

An orbital text label that orbits with the sphere, marking a region's location. One tile per region. Defined in `src/scene/OrbitalTiles.tsx`. Tiles are 3D `<Text>` elements parented to the same animated rotation as the sphere, so they ride along with their region. The active tile glows in the region's accent color; off-camera tiles dim. Tiles are clickable as an alternate navigation path (the sphere drag is the primary one).

## Snap

The spring-animated rotation from a free-spin endpoint to the nearest region's `equatorAngle`. Computed by `snapTarget()` and `snapTargetTo()` in `regions.ts`. Always takes the **shortest signed arc** from the current rotation, preserving multi-rotation offsets (so a user who's spun 3 full turns stays spun, not jumped back to 0).

## Idle hint

A first-visit attention loop. While `hintActive` is true (no `surf:hint-seen` flag in localStorage), the sphere does a slow lateral oscillation and the active tile pulses. Any user interaction (drag, tile click) sets the localStorage flag and ends the hint forever. Logic lives in `useSphereControls.ts`.

## Section panel

The DOM overlay at the bottom of the viewport that slides up when a region is locked on (snap completes). Placeholder content for now (title + lorem). Defined in `src/scene/SectionPanel.tsx`. Driven by `NavContext.activeRegion`. Closing the panel (× button or starting a new drag) returns the sphere to free-spin.

## Low-perf tier

A one-way state set when `<PerformanceMonitor>` detects FPS sustained < 45. Disables `<Bloom>` post-processing and (via `<AdaptiveDpr>`) drops the DPR ceiling. Once entered, never auto-recovers — avoids oscillation. Logic in `src/scene/Scene.tsx`.
