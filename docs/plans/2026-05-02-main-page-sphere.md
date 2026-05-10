# Main Page Sphere — Implementation Plan

**Goal:** Build the main page of evanklem.com — a persistent 3D sphere with 4 face textures (one per section: ABOUT, PROJECTS, ART, GUESTBOOK), spin-to-navigate gesture, orbital tile labels coupled to rotation, snap-to-region animation, and per-region material vibes drawn from the visual reference set. Mobile-perf-budgeted from day 1.

**Architecture:** Single persistent `<Canvas>` hosts the sphere as both hero element and primary navigation. Sections are mapped to 4 equally-spaced points on the sphere's equator (90° apart). Each region renders a placeholder face texture composited with that region's signature material shader (Y2K chrome / wireframe lattice / iridescent prism / halftone dot-matrix). User drags to spin; on release, react-spring snaps to the nearest region. Orbital tiles ride 3D sprites positioned at each region — they rotate with the sphere as wayfinding labels and are also clickable as an accessibility escape hatch. A section-panel overlay slides up when a region locks on, displaying placeholder content for now. PerformanceMonitor + AdaptiveDpr auto-degrade quality on FPS dip.

**Scope locked OUT of this iteration:**
- Real section content (lorem only)
- URL routing / deep links (`#/about` etc.)
- Section-to-section transitions (only "open from sphere" / "close back to sphere")
- Real face artwork (placeholder textures only — Evan replaces later)
- Audio / haptics
- Per-section parallax or easter eggs
- Auto-commit / git ops (this plan ends at "verified, await direction")

---

## File Structure

```
src/main.tsx                          — root mount (no change expected)
src/App.tsx                           — replaces template; hosts <Scene /> + <SectionPanel />
src/scene/Scene.tsx                   — <Canvas> container, lighting, post-fx, perf-monitor wiring
src/scene/Sphere.tsx                  — sphere mesh; binds shader material + face textures
src/scene/sphereMaterial.ts           — custom ShaderMaterial: blends 4 region vibes by UV
src/scene/sphereShaders.ts            — GLSL: vertex + fragment with 4 material branches
src/scene/OrbitalTiles.tsx            — 4 3D-sprite labels orbiting at equator height
src/scene/IdleHint.tsx                — first-visit nudge loop; localStorage-gated
src/scene/SectionPanel.tsx            — DOM overlay; slides up when region active
src/scene/useSphereControls.ts        — drag/touch gesture → rotation + spring-snap
src/scene/regions.ts                  — region constants: id, equator angle, accent color
src/scene/types.ts                    — SectionId, Region, SnapState shared types
src/scene/__tests__/regions.test.ts   — pure-logic tests: nearest-region math, angle wrap
src/scene/__tests__/snap.test.ts      — snap-target selection from arbitrary rotation
src/scene/__tests__/Sphere.smoke.test.tsx — render-without-throw smoke test
public/textures/faces/about.png       — placeholder face (rough, emoji-tier)
public/textures/faces/projects.png    — placeholder face
public/textures/faces/art.png         — placeholder face
public/textures/faces/guestbook.png   — placeholder face
vite.config.ts                        — add vitest config inline (test block)
package.json                          — add vitest + RTL + jsdom
docs/CONTEXT.md                       — domain glossary: Region, Tile, Snap, Face
```

**Deletion test passes:** every file holds non-trivial state or logic that doesn't collapse cleanly into a parent. The shader file split (`sphereMaterial.ts` + `sphereShaders.ts`) is deliberate — GLSL strings are noisy enough that keeping them out of the JS module makes the JS readable.

---

## Parallelization Check

Three potentially independent units exist (gesture hook, shader code, orbital tiles), but they all integrate visually through `Sphere.tsx`, and visual integration is hard to QA via parallel coders. **Recommend sequential execution** via `evanflow-executing-plans` — the work is tightly coupled at the integration seam.

---

## Embedded Grill (plan-level)

1. **Window resize.** r3f handles canvas resize automatically, but orbital tiles must stay locked to their 3D anchor points. Decision: implement tiles as **3D sprites in the scene** (not HTML overlay) so resize is free. If we ever want richer typography in tiles, swap to drei `<Html>` later.

2. **Gesture mid-flight interruption.** If user drags then lets go off-screen, spring should snap to nearest region. If user starts dragging during the idle auto-rotate, auto-rotate pauses and never resumes (single-shot behavior — auto-rotate is for the first-visit hint only).

3. **Existing project patterns.** None — greenfield. CLAUDE.md documents conventions; this plan establishes the scene/ subtree convention.

4. **Domain terms.** Introducing **Region**, **Tile**, **Snap**, **Face**. Capture in `docs/CONTEXT.md` so we're consistent across files. (Glossary task is part of this plan.)

5. **Mobile fail mode.** If FPS < 45 sustained: PerformanceMonitor drops DPR by 0.5, then disables bloom. Test path: Chrome devtools CPU throttle 6× → confirm sphere stays interactive at degraded quality.

6. **Shader compilation cost.** Custom shader compiles on first paint — this can stutter on cold load. Mitigation: declare the material at module top-level, mount it eagerly in `Scene.tsx` so the compile happens during initial mount before user interaction.

---

## Tasks

Each task = ~15–30 min focused work. Within each, steps = ~2–5 min. **TDD applies to logic-bearing code**; configs, GLSL, and visual assets are flagged `[non-TDD]` with a manual verification step.

### Task 1: Test infrastructure setup `[non-TDD]`

**Files:** `package.json`, `vite.config.ts`, `src/scene/__tests__/regions.test.ts` (smoke)

- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Add `test` block to `vite.config.ts`: `environment: 'jsdom'`, `globals: true`
- [ ] Add `"test": "vitest"` and `"test:run": "vitest run"` scripts to package.json
- [ ] Write a placeholder `regions.test.ts` with one trivial passing test
- [ ] `npm run test:run` — confirm passes
- [ ] `npm run build` — confirm typecheck still passes

### Task 2: Region domain model

**Files:** `src/scene/types.ts`, `src/scene/regions.ts`, `src/scene/__tests__/regions.test.ts`

- [ ] **Test first:** `regions.test.ts` — `nearestRegion(rotationY)` returns ABOUT for 0°, PROJECTS for 90°, ART for 180°, GUESTBOOK for 270°, and handles wrap (e.g. 359° → ABOUT)
- [ ] Run test, confirm fails for the right reason (function not exported)
- [ ] Implement `regions.ts`: const array `REGIONS` with `{id, equatorAngle, accentColor, materialId}` × 4; export `nearestRegion(rotationY)`
- [ ] Run test, confirm passes
- [ ] Add edge-case tests: exactly halfway between two regions resolves deterministically; negative angles wrap correctly
- [ ] `npm run test:run` — all green

### Task 3: Snap target math

**Files:** `src/scene/__tests__/snap.test.ts`, `src/scene/regions.ts` (extend)

- [ ] **Test first:** `snapTarget(currentRotation)` returns `{targetAngle, regionId}` where `targetAngle` is the *shortest-path* angle to the nearest region's equatorAngle (e.g. from 350° snap forward to 360°/0°, not backward 350° → 0°)
- [ ] Run test, confirm fails
- [ ] Implement `snapTarget` using shortest-arc math (handle the -180/+180 wrap)
- [ ] Run test, confirm passes
- [ ] Edge cases: rotation already exactly on a region (snap to itself, no movement); rotation at 359.5° snaps forward 0.5°, not backward 359.5°

### Task 4: Bare scene + sphere render `[non-TDD smoke + visual]`

**Files:** `src/scene/Scene.tsx`, `src/scene/Sphere.tsx`, `src/App.tsx`, `src/scene/__tests__/Sphere.smoke.test.tsx`

- [ ] Replace `App.tsx` body with `<Scene />` + black background
- [ ] `Scene.tsx`: `<Canvas dpr={[1, 2]}>` with `<AdaptiveDpr pixelated />`, `<AdaptiveEvents />`, `<PerformanceMonitor />`, default lighting, single `<Sphere />`
- [ ] `Sphere.tsx`: `<mesh><sphereGeometry args={[1, 64, 64]} /><meshStandardMaterial color="#222" /></mesh>` (placeholder material this task)
- [ ] Smoke test: `<App />` renders without throwing in jsdom (mocking Canvas if needed via `vi.mock('@react-three/fiber', ...)`). The test verifies the React tree, not the WebGL output.
- [ ] `npm run dev` — manual: visit localhost, confirm a dark sphere renders against black

### Task 5: Drag-to-spin gesture

**Files:** `src/scene/useSphereControls.ts`, `src/scene/__tests__/useSphereControls.test.tsx`, `src/scene/Sphere.tsx` (wire in)

- [ ] **Test first:** unit test the *math* of the hook (pixel delta → rotation delta), not the gesture binding itself. E.g. `pixelDeltaToRotation(deltaX, viewportWidth)` returns proportional radians.
- [ ] Run test, confirm fails
- [ ] Implement `useSphereControls`: returns `{rotation, bind}` where `bind` is a use-gesture handler and `rotation` is a react-spring-animated value. On drag → update target rotation. On release → call `snapTarget()` and animate to the snap angle with momentum-friendly easing.
- [ ] Run unit math test, confirm passes
- [ ] Wire `bind` into `Sphere.tsx` mesh
- [ ] Manual: in dev, drag the sphere → it spins; release → it snaps to a region

### Task 6: Region shader vibes `[non-TDD visual]`

**Files:** `src/scene/sphereShaders.ts`, `src/scene/sphereMaterial.ts`, `src/scene/Sphere.tsx` (swap material)

- [ ] `sphereShaders.ts`: vertex shader passes UV + worldPos; fragment shader computes `regionId = floor((atan(worldPos.x, worldPos.z) + π) / (π/2))` and branches via `if/else` to one of 4 material vibes. v0 implementations:
  - **ABOUT** (region 0): chartreuse base + fresnel rim + horizontal scanline modulation
  - **PROJECTS** (region 1): near-black base + glowing grid lines via `step(grid, 0.02)` on UV
  - **ART** (region 2): iridescent fresnel × hue rotation by `dot(viewDir, normal)`
  - **GUESTBOOK** (region 3): halftone — neon-green dots via `step(distance to nearest grid point, dotRadius)`
- [ ] `sphereMaterial.ts`: extend three.js ShaderMaterial with these shaders, exposing uniforms (`time`, `accentColor`, `viewMatrix`)
- [ ] Wire into `Sphere.tsx`: replace `meshStandardMaterial` with `<primitive object={sphereMaterial} />`
- [ ] Update uniforms each frame via `useFrame` (drive `time`)
- [ ] Manual: dev server, spin to confirm 4 distinct visual zones with smooth transitions at boundaries (or sharp transitions if we want — decide visually)

### Task 7: Placeholder face textures `[non-TDD asset]`

**Files:** `public/textures/faces/{about,projects,art,guestbook}.png`, `src/scene/sphereShaders.ts` (sample texture)

- [ ] Generate 4 quick placeholder PNGs: 512×512, transparent background, rough emoji-tier face per section concept (Evan-likeness for ABOUT, schematic for PROJECTS, melting trippy for ART, masked for GUESTBOOK). Use any tool — just need pixels for now. Tone: deliberately rough so we don't get attached.
- [ ] Modify fragment shader: sample face texture by region's local UV, multiply with material vibe color
- [ ] Wire textures into shader uniforms in `Sphere.tsx` via drei `useTexture`
- [ ] Manual: dev server — each region now shows a face inside its material vibe

### Task 8: Orbital tile labels

**Files:** `src/scene/OrbitalTiles.tsx`, `src/scene/Scene.tsx` (mount)

- [ ] `OrbitalTiles.tsx`: returns a `<group>` containing 4 `<Sprite>` components positioned at `[cos(angle), 0, sin(angle)] * 1.4` (just outside the sphere) for each region. Each sprite uses a small text texture (drei `<Text>` projected to sprite or pre-rendered canvas-texture).
- [ ] Tiles share the sphere's group rotation so they orbit in lockstep — implement by parenting the tile group to the same rotation source as the sphere
- [ ] Active region's tile uses brighter material/scale; off-camera tiles dim. Detect "active" via dot product of tile-direction vs camera-direction.
- [ ] Tile click → call `snapTo(regionId)` (extend useSphereControls to expose this imperative method)
- [ ] Manual: spin sphere, confirm tiles rotate together; click a tile, confirm sphere animates to it

### Task 9: Idle hint loop

**Files:** `src/scene/IdleHint.tsx`, `src/scene/Sphere.tsx` (consume hint state)

- [ ] On mount, check `localStorage['surf:hint-seen']`. If unset, start a 5-second idle nudge: sphere rotates +/- ~10° lazily; the focused tile gently scales/glows in a sine pulse
- [ ] Any user gesture (drag, click, key) → set the localStorage flag → stop the hint forever
- [ ] Component returns nothing visually itself; it just drives a context/zustand-equivalent piece of state that Sphere/Tiles read
- [ ] Manual: in private/incognito window, confirm hint runs; touch sphere, refresh, confirm hint doesn't repeat

### Task 10: Section panel placeholder

**Files:** `src/scene/SectionPanel.tsx`, `src/App.tsx` (mount as DOM overlay above canvas)

- [ ] DOM (not r3f) overlay positioned absolutely over the canvas. When a snap completes, panel slides up from the bottom (CSS transform + opacity transition) showing region's title + lorem
- [ ] Close button → snap state clears → panel slides back down → sphere returns to free-spin
- [ ] State source: same hint-state context from Task 9, extended with `activeRegion: SectionId | null`
- [ ] Manual: spin to a region or click a tile; panel appears with correct title; close it; sphere is interactive again

### Task 11: Selective bloom post-process

**Files:** `src/scene/Scene.tsx` (add `<EffectComposer>` + `<Bloom>` + `<SelectiveBloom>`)

- [ ] Wrap scene in `@react-three/postprocessing` `<EffectComposer>` with `<Bloom>` configured for `mipmapBlur`, `luminanceThreshold: 0.6`, `intensity: 0.8`, `resolutionScale: 0.5` (half-res — mobile critical)
- [ ] Mark only emissive elements (active tile, glowing shader regions) with `layers={1}` so bloom is selective, not full-scene
- [ ] Manual: confirm visible glow on active tile + emissive shader regions; confirm FPS holds on phone

### Task 12: Performance auto-degrade

**Files:** `src/scene/Scene.tsx` (extend PerformanceMonitor callbacks)

- [ ] `<PerformanceMonitor onDecline={...}>`: when FPS drops sustained < 45, drop DPR ceiling from 2 → 1.5; if still declining, set state flag `bloomEnabled = false` and conditionally render `<Bloom>`
- [ ] No automatic recovery — once degraded, stay degraded for the session (avoids oscillation)
- [ ] Manual: open Chrome devtools, throttle CPU 6×, confirm DPR drop and bloom disable kick in

### Task 13: Glossary doc `[non-TDD doc]`

**Files:** `docs/CONTEXT.md`

- [ ] Define: **Region**, **Tile**, **Snap**, **Face**, **Idle Hint**, **Section Panel**
- [ ] Reference from CLAUDE.md so future agents/contributors find it

### Task 14: Self-review iterate

Hand off to `evanflow-iterate` for the 5-cycle quality pass. Report findings, await direction.

---

## Definition of Done

After Task 14, the main page meets all of:

- [ ] `npm run build` passes (typecheck + Vite build clean)
- [ ] `npm run lint` clean
- [ ] `npm run test:run` green
- [ ] Bundle gzip stays at or below ~250KB (target ≈ 200KB; allow some slack)
- [ ] Sphere renders, spins on drag, snaps to nearest region, displays 4 face textures with 4 distinct material vibes
- [ ] Orbital tiles orbit with the sphere, glow when active, are clickable
- [ ] Idle hint runs on first visit, doesn't repeat
- [ ] Section panel opens on snap, closes back, sphere stays interactive
- [ ] On a real phone (test on Evan's): smooth interaction, no jank, FPS stays > 45 in normal use; degrades gracefully if pushed
- [ ] Plan ends here. **No git operations** — Evan stages and commits when satisfied.

---

## Hand-off

→ `evanflow-executing-plans` (sequential — see parallelization check above)
→ Inside each code task: `evanflow-tdd` for logic-bearing tasks, manual smoke for visual/asset tasks
→ After all tasks: `evanflow-iterate`, then stop and report
