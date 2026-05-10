# UI Overhaul Sweep — Prototype → Real Deal

**Date:** 2026-05-03
**Goal:** Bring evanklem.com from prototype to full visual finish.

## Locked design decisions (from brainstorming)

- **Sphere identity** — bas-relief Olmec/Aztec masks on a unified sphere; full PSX (vertex jitter, affine UV warp, 4×4 Bayer dither, 16-color palette quantize); subtle life (eye glow on active region, slow blink, occasional twitch).
- **Per-region masks** — ABOUT (calm, eyes closed), PROJECTS (watchful, brow furrowed), ART (open mouth, elaborate headdress / Quetzalcoatl-coded), GUESTBOOK (head tilted, listener pose).
- **Palette — polychrome Aztec.** Masks: jade (`#5fa67a`), obsidian (`#0d0a14`), turquoise (`#3fb6c8`), ochre (`#c47a3a`); chartreuse `#c4ff00` reserved for active eye glow + UI accents only. Stone base `#2a2f24`, near-black `#0a0a08`.
- **Background** — slow lava-lamp metaball flow in obsidian + chartreuse, on top of existing CSS film-grain.
- **Section panel** — frosted Xbox-360 blade. Translucent chartreuse-tinted glass, backdrop-blur, animated gradient sweep, glow border keyed to active region accent.
- **Boot sequence** — power-on dashboard (chartreuse line draws → expands to ring → sphere materializes inside → ring dissolves). Plays every visit. Skippable.
- **Typography** — Alfa Slab One (display, monumental slab; substitutes for PP Mondwest given free-licensing constraint), Inter (body; substitutes for PP Neue Montreal), Space Mono (mono, kept).
- **Cursor** — small chartreuse ring follows pointer with lerp lag, expands over interactive elements. Skip on touch.
- **Out of scope this sweep** — broadcast HUD chrome, idle screensaver, ambient audio.

## Authoring approach

**Procedural — no Blender, no manual PNG painting.**

A build-time Node script (`scripts/gen-masks.ts`) composes Olmec features from SDF primitives (ellipses, capsules, planes, smooth-min) into 4 grayscale heightmap PNGs and 4 polychrome diffuse PNGs. Re-runnable with knobs to tune feature depth, position, sharpness. Vertex shader displaces the sphere by sampling each region's heightmap in its quadrant; fragment shader applies PSX clay treatment.

## File structure

### New files

- `scripts/gen-masks.ts` — SDF primitive lib + 4 mask compositions; outputs PNGs to `public/textures/masks/`. Deletion test: removing this means committing baked PNGs and losing the iterate knob — keep.
- `public/textures/masks/{about,projects,art,guestbook}-height.png` — generated heightmaps. Vertex displacement source.
- `public/textures/masks/{about,projects,art,guestbook}-diffuse.png` — generated polychrome diffuse maps.
- `src/styles/fonts.css` — `@font-face` declarations + `:root` font-family stacks.
- `src/styles/panel.css` — frosted-blade section panel styles.
- `src/styles/cursor.css` — custom cursor + cursor-none body rule.
- `src/scene/LavaLampBackground.tsx` — full-screen quad behind sphere.
- `src/scene/lavaLampShaders.ts` — metaball flow shader.
- `src/scene/BootSequence.tsx` — power-on dashboard intro (DOM/SVG, not in canvas).
- `src/scene/BootSequence.css` — boot sequence keyframes.
- `src/scene/Cursor.tsx` — DOM cursor follow component.
- `src/hooks/useIdleBreath.ts` — drives subtle scale + tilt drift after N seconds of inactivity.
- `src/scene/maskRegions.ts` — per-region mask metadata: eye UV coords for glow, headdress params (if exposed). Keeps `regions.ts` lean as single source of nav truth.

### Files rewritten substantially

- `src/scene/sphereShaders.ts` — was 4-vibe quadrant branching; becomes one PSX clay shader with displacement vert + dither/quantize/affine frag.
- `src/scene/sphereMaterial.ts` — uniform set changes (heightmaps, diffuse maps, snap, blink phase, active region).
- `src/scene/Sphere.tsx` — load mask textures (heightmap+diffuse), bump segments to 96, drop face-texture loop.
- `src/scene/SectionPanel.tsx` — restructure for frosted blade aesthetic.
- `src/scene/Scene.tsx` — add LavaLampBackground, ensure render order.
- `src/scene/regions.ts` — drop `materialId`, update accent colors to polychrome palette.
- `src/scene/types.ts` — drop `MaterialId`, add eye UV coords on `Region` (or push to `maskRegions.ts`).
- `src/scene/OrbitalTiles.tsx` — type styling refresh to Alfa Slab One.
- `src/App.tsx` — orchestrate boot → scene transition + mount cursor.
- `src/index.css` — strip section-panel rules; integrate font + palette tokens; keep grain.

### Files deleted

- `public/textures/faces/{about,projects,art,guestbook}.png` — replaced by mask system. Confirm no other references before deleting.

### Files unchanged

- `src/scene/regions.ts` snap math (`signedShortestArc`, `nearestRegion`, `snapTarget`) — survives unchanged.
- `src/scene/useSphereControls.ts` — drag/snap behavior, idle hint logic, all stays. New idle-breath layered on top, not replacing.
- `src/scene/NavProvider.tsx`, `navContext.ts` — unchanged.
- Tests in `src/scene/__tests__/` — snap and regions tests still apply.

## Bite-sized tasks

(Tracked via the task list. See task IDs 1-13.)

1. Plan doc (this) — DONE on first pass
2. Palette + typography foundation
3. Procedural mask generator script
4. Run generator, review output
5. Sphere shader rewrite (PSX clay + displacement vert)
6. Sphere material + mesh wiring
7. Subtle life: blink + idle breath
8. Lava lamp background
9. Section panel restyle
10. Boot sequence
11. Custom cursor
12. Tile label restyle
13. Integration + visual verification

## Risks / things to watch

- **Mask readability at low displacement.** Bas-relief at small heights can read blobby. Mitigation: SDF script has `featureSharpness` and `displacementScale` knobs; iterate with screenshots.
- **Vertex jitter intensity.** Too much = nauseating; too little = invisible. Start at `snapFactor = 200` (snap to pixel-eighths at 1080p), tune.
- **Affine UV warping** is most visible on flat planes; on a sphere it's subtle. Lean in by skipping perspective divide in varying interpolation.
- **Mobile WebGL budget.** 96 segments = ~9.5k tris. Plus lava lamp full-screen quad. Plus bloom (current). Should fit, but `<PerformanceMonitor>` already drops bloom on low-tier.
- **Font availability.** Alfa Slab One + Inter via Fontsource (free, npm). PP Mondwest swap noted; if Evan later wants the original, vendor manually.
- **Boot sequence on every visit.** May annoy returning users. Make skippable with click anywhere; also flip to first-visit-only via localStorage if Evan dislikes.
- **Eye glow UV coords** must be authored alongside the mask SDF script — they're per-mask data. Keep them in `maskRegions.ts` next to the mask spec.

## Verification checklist (per-phase)

- After each task: `npm run build` (typecheck via tsc -b) clean; `npm run lint` clean.
- After visual tasks: dev server + chromium headless screenshot.
- Final: full integration screenshot + manual interaction smoke test.
- Tests: existing snap/region tests still pass; new components don't need TDD per CLAUDE.md unless behavior is non-obvious (mostly visual).
