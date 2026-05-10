# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project vision

This repo (`surf`) will become **evanklem.com** (or a similar personal-domain landing) — Evan Klem's personal site.

**Core concept:** the homepage is a 3D **sphere** that the user rotates/spins to navigate the site. Each face/region of the sphere is a section with its own distinctive texture/material treatment. Confirmed sections:

- **About**
- **Projects**
- **Art** (gallery for Evan's own art)
- **Oracle** (procedural-tarot fortune-telling — see `docs/plans/2026-05-08-oracle-section-spec.md`)

**Aesthetic direction:** "very hip and awesome" — explicit reference to **original Xbox dashboard / Xbox 360 blade UI** energy: glowing translucent panels, ambient motion, soft volumetric shapes, atmospheric depth, mid-2000s futuristic playfulness. Each sphere region's texture should feel like a distinct material (think: liquid, chrome, frosted glass, organic, woven, etc.) rather than flat color. Visual inspiration was provided as a set of Discord-CDN image links (signed/expiring URLs — saved as a project memory note rather than relied on long-term).

## Workflow: evanflow

Evan maintains his own Claude Code skill suite, **evanflow** (`github.com/evanklem/evanflow`), a TDD-driven feedback loop with 16 cohesive skills covering brainstorm → plan → execute → iterate → complete, plus special-purpose skills (debug, review, prd, qa, design-interface, improve-architecture, glossary, go) and a `evanflow-compact` context-management skill. Default loop: `evanflow-brainstorming`, `evanflow-writing-plans`, `evanflow-executing-plans`, `evanflow-tdd`, `evanflow-iterate`. The orchestrator stops at checkpoints and waits for direction — no auto-commits.

When Evan says **"let's evanflow this"**, hand off to the evanflow orchestrator and walk the loop. For non-trivial features on this site, prefer evanflow's brainstorm → plan → execute path over jumping straight to code.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build for production via Vite
- `npm run lint` — run ESLint over the repo
- `npm run preview` — preview the production build locally

No test runner is configured yet. If/when tests are added (likely Vitest given Vite), update this section.

## Architecture (current state)

This is still the stock Vite + React 19 + TypeScript starter — almost no project code has been written yet:

- Entry point: `src/main.tsx` mounts `<App />` into `#root` from `index.html`
- `src/App.tsx` is the only component — a static landing page with a counter (placeholder, will be replaced)
- Static SVG sprites (`public/icons.svg`) are referenced via `<use href="/icons.svg#..." />`
- Split TS configs: `tsconfig.app.json` (app code under `src/`) and `tsconfig.node.json` (Vite/build config). `tsconfig.json` references both.
- ESLint flat config (`eslint.config.js`) extends `tseslint.configs.recommended`, `react-hooks`, and `react-refresh/vite` — type-aware lint rules are *not* enabled.

## Dependencies (installed)

Picked with **mobile WebGL performance** as a hard constraint — phones must run this smoothly. Bundle target ≈ 200KB gzipped for the 3D layer.

**Runtime (3D stack):**
- `three` — WebGL renderer
- `@react-three/fiber` — React reconciler for three.js
- `@react-three/drei` — helpers (cameras, controls, loaders, `<AdaptiveDpr />`, `<AdaptiveEvents />`, `<PerformanceMonitor />`, `useKTX2`)
- `@react-three/postprocessing` — for **selective bloom** (emissive layer only, half-res) — this carries the Xbox-dashboard glow without nuking mobile fillrate
- `@react-spring/three` — animated, momentum-friendly transitions when snapping the sphere to a section
- `@use-gesture/react` — touch-first drag/pinch gestures for spinning the sphere

**Dev:** `@types/three` (TS types).

**Deliberately NOT added (yet):**
- Routing — skip until the 5 sections crystallize; if added, prefer `wouter` over React Router for size.
- State manager — React built-ins are enough for ~5 sections; reach for Zustand only if shared scene state gets unwieldy.
- `vitest` / RTL — add when we start the evanflow TDD loop.
- `lamina`, `framer-motion`, raw shader libs — wait for a concrete need.

## Mobile performance budget (hard rules)

These are constraints, not suggestions — violating them re-introduces the perf risk we deliberately avoided:

- **DPR cap:** `<Canvas dpr={[1, 2]}>` — never let iPhones render at native dpr=3.
- **Adaptive quality:** mount `<AdaptiveDpr pixelated />` + `<AdaptiveEvents />` so resolution drops while the user is interacting.
- **Sphere geometry:** ≤ 64 segments. Detail comes from normal maps, not polygons.
- **Textures:** prefer **KTX2 / Basis Universal** compressed (via drei `useKTX2`); avoid binding more than ~3–4 unique 2K textures simultaneously.
- **Bloom:** **selective only** (emissive layer), rendered at half resolution. Never enable full-scene bloom.
- **No realtime shadows** — fake with gradient maps or bake.
- **Single persistent `<Canvas>`** — never unmount per-section; sections swap content inside the same scene.
- **`<PerformanceMonitor>`:** wire it up to auto-degrade quality (drop DPR, disable bloom) when FPS drops below ~45.

If a feature can't fit these rules, re-design the feature — don't widen the budget.

## Likely architecture (to be decided)

- Single `<Canvas>` rendering the persistent sphere; sections are textured surface regions
- Routing layered on top later for deep links (`#/about`, `#/projects`, `#/art`) — `wouter` if/when added
- Per-section textures as KTX2 assets in `public/textures/<section>/` (or procedural via shaders)
- Lazy-load section content; keep first-paint shader cheap

## Glossary

Domain terms (Region, Face, Material vibe, Tile, Snap, Idle hint, Section panel, Low-perf tier) live in `docs/CONTEXT.md`. Keep terminology consistent with that file.
