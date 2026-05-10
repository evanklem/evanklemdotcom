# Projects Section Implementation Spec

Date: 2026-05-06  
Project: `/home/klemlitos/Dev/surf`  
Scope: Projects body inside the existing `SectionPanel`

## Goal

Replace the generic Projects placeholder with a polished project browser that feels like a retro inventory screen: PS1-adjacent, dark green frosted glass, glyphic, atmospheric, readable, and grounded in Evan's actual project work.

This spec is meant to survive context clearing. It captures the design questioning, content decisions, assets, project list, interaction model, and implementation boundaries from the planning conversation.

## Files To Touch

Prefer keeping implementation scoped to:

- `src/scene/SectionPanel.tsx`
- `src/styles/panel.css`

Allowed if it materially improves maintainability:

- `src/scene/projects.ts` or similar local data file for project definitions.

Do not touch broader scene/navigation behavior unless absolutely necessary.

Preserve:

- Existing panel shell.
- Existing slide-in desktop behavior.
- Existing slide-up mobile behavior.
- Existing `Projects` title rendering.
- Existing close/back behavior for the section panel.
- Existing About implementation.
- Existing Art and Guestbook placeholder behavior.

## Existing Context

`SectionPanel.tsx` currently renders a shared lorem-style placeholder for non-About sections. About already has a custom body with:

- Tinted frosted glass.
- PSX/dither texture.
- Beveled compact cards.
- Segmented controls.
- Strong but restrained visual structure.
- A custom About back button.

Projects should align with that system but should not feel like another About screen. It should be its own distinct interface: an artifact/inventory browser.

The Projects section accent color comes from `src/scene/regions.ts` and should remain the existing green. Do not introduce per-project accent colors.

## Hard No

Do not use:

- Scattered desktop windows.
- Fake draggable windows.
- Modal overlays that fight the existing section panel.
- Inline project expansions that make the grid jump unpredictably.
- Multiple expanded projects open at once.
- Corporate portfolio cards.
- Bright multicolor category accents.
- Generic tech-logo-first cards.
- Fake locked/private/unfinished statuses.
- Fake live/demo links.
- Repeated "What I owned" sections on every project.
- Long essay-style case studies.
- Tiny unreadable terminal text.
- Heavy glitch effects.
- Text over busy media without a readable backing layer.

## Audience

Primary audience:

- Founders.
- AI product people.
- Technical teams looking for someone who can build product end to end.

Secondary audience:

- Recruiters who need to scan quickly.

The section should optimize for technical/founder visitors who click around and get a sense of taste, while still making the project list easy to scan.

## Core Takeaway

After 20 seconds, the visitor should believe:

- Evan builds complete projects end to end.
- Evan can move between product, interface, backend systems, AI workflows, and tooling.
- Evan has taste and can make technical work feel intentional.
- Evan has both professional product work and public/open-source proof.

Use a global framing line near the top:

```text
End-to-end projects I designed, built, and shipped across product, interface, backend systems, AI workflows, and tooling.
```

Do not repeat "ownership" on every project. The planning decision was that Evan owned all of these end to end, so a repeated ownership section would waste space.

## Visual Direction

Chosen direction:

> A dark green PS1 inventory grid, using cloud fragments and glyphic project emblems.

It should stylistically align with About through:

- Frosted dark glass.
- Green accent.
- Hard beveled borders.
- Dither/scanline overlays.
- Compact mono labels.
- Fixed media frames.
- Controlled density.

It should feel distinct from About through:

- Inventory-grid layout.
- Project artifact tiles.
- Cloud image backgrounds.
- Large glyph/emblem overlays.
- Detail view that feels like inspecting a selected artifact.

## Color

Use the existing Projects green throughout.

Do not assign unique colors per project. Variation should come from:

- Different cloud tile crops.
- Different glyph/emblem silhouettes.
- Different project titles/copy.
- Screenshot availability inside detail views.

## Assets

Existing project screenshots:

- `/content/projects/landingephemera.png`
- `/content/projects/aiinboxephemera.png`
- `/content/projects/omarchytheme.png`

Cloud source:

- `/content/projects/cloud.png`

Generated cloud tiles:

- `/content/projects/clouds/cloud-tile-00.png`
- `/content/projects/clouds/cloud-tile-01.png`
- `/content/projects/clouds/cloud-tile-02.png`
- `/content/projects/clouds/cloud-tile-03.png`
- `/content/projects/clouds/cloud-tile-04.png`
- `/content/projects/clouds/cloud-tile-05.png`
- `/content/projects/clouds/cloud-tile-06.png`
- `/content/projects/clouds/cloud-tile-07.png`
- `/content/projects/clouds/cloud-tile-08.png`

All cloud tiles are `281x233`.

There are now 7 projects, so use 7 cloud tiles as project backgrounds and keep 2 as reserves/alternates. The nine generated tiles line up with the final project count plus backups.

## Glyph Source

Existing site glyphs were sourced from:

- `https://mayaglyphs.org/`

The current CSS comments say the existing glyph watermarks are sourced from mayaglyphs.org. The user is comfortable with licensing/attribution risk and asked to use fitting symbols from the same website where possible.

Implementation guidance:

- Source new project-specific glyph images from mayaglyphs.org where possible.
- Preserve the same treatment used by existing glyphs: monochrome mask, green fill, dark shadow offset, glow, dither/scanline texture.
- Prefer real glyph images over hand-drawn generic SVGs for final implementation.
- If a selected glyph asset requires cleanup, create normal and inverted/mask-friendly variants matching the current `public/glyphs/*` pattern.
- Put new assets in `public/glyphs/projects/` or another clearly named folder.
- Document source URLs in a small attribution note if practical.

Recommended symbolic mapping:

- Ephemera Web Platform: house/container/page/portal-like glyph.
- AI Talent Agent: speech/message/eye/head glyph.
- Evanflow: path/road/flow/cycle glyph.
- Omarchy Avocado Theme: leaf/green/home glyph.
- AI Fraud Detection System: shield/flint/warning/protection glyph.
- 8bitcpu: number/square/block/tool/build glyph.
- PartyPredict: speech/vote/person/group/probability-like glyph.

The mapping does not need to be literal. It should feel visually fitting and readable as a project emblem.

## Project List

Final project count: 7.

Recommended display order:

1. Ephemera Web Platform
2. AI Talent Agent
3. Evanflow
4. Omarchy Avocado Theme
5. AI Fraud Detection System
6. 8bitcpu
7. PartyPredict

Reasoning:

- Professional product work first.
- Public/open-source credibility next.
- Technical/ML/computer-architecture projects after.
- AI Fraud Detection should be framed as Evan's final college project, not as an unfinished Python side project.
- PartyPredict added as another completed classifier/project.

## Links

Use links only where real. No fake live/demo buttons.

Known links:

- Evanflow: `https://github.com/evanklem/evanflow`
- Omarchy Avocado Theme: `https://github.com/evanklem/omarchy-avocado-theme`
- 8bitcpu: `https://github.com/evanklem/8bitcpu`
- PartyPredict: `https://github.com/evanklem/partypredict`

Ephemera Web Platform:

- No public link unless the user adds one later.
- Show no fake link.

AI Talent Agent:

- No public link unless the user adds one later.
- Show no fake link.

AI Fraud Detection System:

- No public link unless the user adds one later.
- This was Evan's final project for college.
- The user plans to publish/add it before site publication. If a GitHub link exists at implementation time, include it. Otherwise omit link UI rather than displaying an unfinished status.

## Screenshot Rules

Use screenshots where available and do not invent missing media.

Projects with screenshots:

- Ephemera Web Platform: `/content/projects/landingephemera.png`
- AI Talent Agent: `/content/projects/aiinboxephemera.png`
- Omarchy Avocado Theme: `/content/projects/omarchytheme.png`

Projects without screenshots:

- Evanflow
- AI Fraud Detection System
- 8bitcpu
- PartyPredict

Collapsed grid should stay consistent:

- Always use cloud tile + glyph as the primary tile visual.
- Do not mix screenshots into the collapsed grid as the main visual.

Expanded detail view:

- Use cloud tile + glyph as the hero identity.
- If screenshots exist, show them below the hero in framed media panels.
- If no screenshots exist, simply omit screenshot area.
- Do not show "missing image" placeholders.

Recommended screenshot layout:

- Hero identity at top: cloud + glyph.
- Screenshot stack below, not a carousel.
- One large framed screenshot per available image.
- Compact captions only if useful.

## Interaction Model

Use a two-state browser:

1. Grid/list state.
2. Selected project detail state.

Collapsed grid:

- Display all project artifact tiles.
- Each tile is a real `button` or accessible interactive element.
- Each tile opens the detail view for exactly one project.

Selected detail:

- Replace the grid with the selected project detail inside the same Projects panel.
- Provide a clear `Back to projects` button.
- Only one project can be selected at a time.
- No modal overlay.
- No inline accordion expansion.
- No side-by-side master/detail layout as the primary interaction; the panel is too narrow and mobile needs a single clear flow.

Keyboard/accessibility:

- Tiles must be keyboard focusable.
- Back button must be keyboard focusable.
- Use visible focus states matching the About controls.
- Use semantic headings for each project detail.
- Images need useful alt text.
- Decorative glyph overlays should be `aria-hidden` if the title conveys the project identity.

## Layout Direction

Desktop grid inside existing right-side panel:

```text
PROJECTS

End-to-end projects I designed, built, and shipped...

┌──────────────────┐ ┌──────────────────┐
│ cloud + glyph     │ │ cloud + glyph     │
│ EPHEMERA WEB      │ │ AI TALENT AGENT   │
│ Creator platform  │ │ LLM email agent   │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ EVANFLOW          │ │ OMARCHY THEME     │
...
```

Recommended grid:

- Desktop: 2 columns.
- Mobile: 1 column.

Avoid 3 columns inside the slide panel; it will make names and descriptions cramped.

Tile anatomy:

```text
┌────────────────────┐
│ cloud background    │
│ centered glyph      │
│ subtle dither       │
├────────────────────┤
│ PROJECT NAME        │
│ Short category line │
│ small metadata row  │
└────────────────────┘
```

Expanded detail anatomy:

```text
← PROJECTS

┌────────────────────────────┐
│ cloud background + glyph   │
└────────────────────────────┘

PROJECT NAME
Short, concrete summary.

WHAT IT IS
...

WHAT I BUILT
...

HOW IT WORKS
...

STACK
...

SIGNAL
...

[GitHub] [other real links if available]

[Screenshot frame(s), if available]
```

Medium-short detail pages are preferred. They can scroll, but should not become long articles.

## Copy Tone

Use terse mini case studies.

Tile copy:

- Neutral/object style.
- Short.
- Easy to scan.

Detail copy:

- Can use first person lightly.
- Grounded.
- Specific.
- Not resume bullets.
- Not corporate.
- Not AI hype.

Use section labels:

- `What It Is`
- `What I Built`
- `How It Works`
- `Stack`
- `Signal`
- `Links`

Do not use `What I Owned` as a section because every project was end-to-end.

## Project Content Drafts

### Ephemera Web Platform

Slug: `ephemera-web`

Tile line:

```text
Full-stack creator platform.
```

Summary:

```text
A creator platform with an AI-powered inbox, landing page, admin dashboard, authentication, data layer, and product workflows.
```

What It Is:

```text
Ephemera Web Platform was the product surface for a creator-focused AI platform: landing page, inbox, admin tooling, user flows, and the backend systems around them.
```

What I Built:

```text
I built the frontend in TypeScript and React with Vite and Tailwind, wired data fetching and state management with TanStack Query and tRPC, and designed the PostgreSQL/Supabase layer with Kysely migrations.
```

How It Works:

```text
The platform connects authenticated user flows to structured product data for users, deals, emails, purchases, and platform events. Server-side validation, row-level security, and rate limiting protect user isolation and data integrity.
```

Stack:

```text
React, TypeScript, Vite, Tailwind, TanStack Query, tRPC, Supabase, PostgreSQL, Kysely
```

Signal:

```text
Shows end-to-end product engineering in a real startup context: interface, backend, auth, data modeling, and shipping under pressure.
```

Media:

- `/content/projects/landingephemera.png`

Links:

- None unless added later.

### AI Talent Agent

Slug: `ai-talent-agent`

Tile line:

```text
LLM email agent for creator deals.
```

Summary:

```text
An AI talent agent that ingests inbound brand deals, extracts structured deal data, evaluates creator constraints, and drafts negotiated responses.
```

What It Is:

```text
A multi-stage AI workflow for handling inbound creator brand deals across Gmail, Outlook, and custom email infrastructure.
```

What I Built:

```text
I built the LLM evaluation pipeline, email ingestion flow, deterministic constraint checks, negotiated response generation, and Stripe-based invoicing path with manual fallback for edge cases.
```

How It Works:

```text
Inbound messages are processed through OAuth-connected email providers, Google Pub/Sub, and Microsoft Graph. The system extracts deal terms, applies creator-defined boundaries such as minimum compensation and brand exclusions, and uses LLM evaluation where judgment is needed.
```

Stack:

```text
LLMs, Anthropic Claude API, Gmail OAuth, Google Pub/Sub, Microsoft Graph API, Stripe, TypeScript backend systems
```

Signal:

```text
Shows practical AI product work: deterministic rules where correctness matters, LLM judgment where ambiguity exists, and real workflow integration around email and payments.
```

Media:

- `/content/projects/aiinboxephemera.png`

Links:

- None unless added later.

### Evanflow

Slug: `evanflow`

Tile line:

```text
Claude Code workflow system.
```

Summary:

```text
An open-source TDD-driven iterative agent workflow system for Claude Code.
```

What It Is:

```text
Evanflow is a workflow layer for Claude Code that guides software work through repeated cycles of ideation, planning, implementation, testing, review, and failure analysis.
```

What I Built:

```text
I built 16 custom skills and an orchestration layer that enforce structured feedback loops, human checkpoints, and repeated refinement rather than one-shot generation.
```

How It Works:

```text
The system packages a repeatable agent workflow around TDD, self-review, and failure-mode analysis so features can move through a disciplined loop instead of drifting across context or scope.
```

Stack:

```text
Claude Code, agent workflows, custom skills, TDD, shell/tooling conventions
```

Signal:

```text
Shows open-source taste and a real workflow born from building production AI software. Resume says 350+ GitHub stars as of May 2026; the repo may show a higher live count.
```

Links:

- `https://github.com/evanklem/evanflow`

Media:

- No screenshot currently.

### Omarchy Avocado Theme

Slug: `omarchy-avocado-theme`

Tile line:

```text
Linux desktop theme.
```

Summary:

```text
A cohesive avocado-green desktop theme for the Arch-based Omarchy Linux environment.
```

What It Is:

```text
Omarchy Avocado Theme is a full desktop visual theme for Omarchy, covering the terminal, window manager, status bar, wallpapers, and app surfaces.
```

What I Built:

```text
I designed and packaged a cohesive desktop look that feels consistent across the Linux environment instead of stopping at a wallpaper or terminal palette.
```

How It Works:

```text
The theme coordinates color, UI treatment, and environment-level assets across the parts of Omarchy users see all day.
```

Stack:

```text
Linux theming, Omarchy, terminal/window-manager styling, desktop UI assets
```

Signal:

```text
Shows taste, open-source contribution, and comfort shaping the computing environment itself. The theme is included in Omarchy's Extra Themes documentation.
```

Links:

- `https://github.com/evanklem/omarchy-avocado-theme`

Media:

- `/content/projects/omarchytheme.png`

### AI Fraud Detection System

Slug: `ai-fraud-detection`

Tile line:

```text
Python fraud classifier.
```

Summary:

```text
A college final project: a credit card fraud detection system trained on 284,807 transactions with an extreme class imbalance.
```

What It Is:

```text
A Python machine learning final project for classifying credit card fraud from transaction data where fraudulent samples make up less than 1 percent of the dataset.
```

What I Built:

```text
I built the full ML pipeline: preprocessing with pandas, feature scaling, SMOTE-based synthetic data generation, model training with scikit-learn and XGBoost, and a Streamlit prediction interface.
```

How It Works:

```text
The model handles class imbalance with synthetic minority oversampling, uses cross-validation and randomized hyperparameter tuning, and returns fraud classifications with confidence scoring in the interface.
```

Stack:

```text
Python, pandas, scikit-learn, XGBoost, SMOTE, Streamlit
```

Signal:

```text
Shows practical ML implementation beyond toy demos: imbalanced data, model evaluation, tuning, and a usable prediction surface built as a capstone-style college project.
```

Links:

- Add GitHub link if available by implementation time; otherwise omit.

Media:

- No screenshot currently.

### 8bitcpu

Slug: `8bitcpu`

Tile line:

```text
Logisim 8-bit CPU.
```

Summary:

```text
A completed 8-bit CPU built in Logisim using Von Neumann architecture.
```

What It Is:

```text
A working Logisim CPU design with an 8-bit data bus, registers, ALU, RAM, main bus, and control signals.
```

What I Built:

```text
I built the CPU as a `.circ` circuit file, debugging the ALU, registers, RAM, bus, and control logic until the architecture worked together as a complete simulated machine.
```

How It Works:

```text
The project models a basic Von Neumann-style CPU in Logisim with instruction/data storage, arithmetic logic, shared bus behavior, and simulation-ready components.
```

Stack:

```text
Logisim, digital logic, CPU architecture, ALU, registers, RAM, control signals
```

Signal:

```text
Shows low-level systems understanding and a willingness to build the machinery underneath abstractions.
```

Links:

- `https://github.com/evanklem/8bitcpu`

Media:

- No screenshot currently.

### PartyPredict

Slug: `partypredict`

Tile line:

```text
Java Naive Bayes classifier.
```

Summary:

```text
A survey-based classifier that predicts political party affiliation from responses before a survey is complete.
```

What It Is:

```text
PartyPredict is a Java machine learning project that collects survey responses, stores them in CSV format, and predicts party affiliation with a Naive Bayes classifier.
```

What I Built:

```text
I built the survey/data flow, CSV-backed training setup, Naive Bayes implementation, Laplace smoothing, weighted features, retraining support, and evaluation metrics.
```

How It Works:

```text
As new labeled survey data arrives, the classifier can retrain and evaluate performance with accuracy, precision, recall, and F1. Laplace smoothing prevents zero-probability failures from rare or missing responses.
```

Stack:

```text
Java, CSV data, Naive Bayes, Laplace smoothing, weighted features, accuracy, precision, recall, F1
```

Signal:

```text
Shows fundamentals-first machine learning work: probabilistic modeling, feature encoding, evaluation, and retrainability without hiding behind a framework.
```

Links:

- `https://github.com/evanklem/partypredict`

Media:

- No screenshot currently.

## Suggested Data Shape

Use a data-driven component so every project uses the same component.

```ts
type Project = {
  id: string
  name: string
  shortName?: string
  category: string
  tileLine: string
  summary: string
  cloud: string
  glyph: string
  glyphAlt?: string
  screenshots?: Array<{
    src: string
    alt: string
    caption?: string
  }>
  links?: Array<{
    label: string
    href: string
  }>
  sections: Array<{
    title: 'What It Is' | 'What I Built' | 'How It Works' | 'Stack' | 'Signal'
    body: string | string[]
  }>
}
```

Implementation can keep the data in `SectionPanel.tsx` if the file remains manageable. If it becomes long, move to `src/scene/projects.ts`.

## Component Structure

Recommended additions in `SectionPanel.tsx`:

- `ProjectsPanelBody`
- `ProjectGrid`
- `ProjectTile`
- `ProjectDetail`
- `ProjectMediaFrame`

`SectionPanel` behavior:

- Keep existing `AboutPanelBody` path for `about`.
- Use `ProjectsPanelBody` for `projects`.
- Keep `p.panel__body` placeholder for `art` and `guestbook`.

State:

```ts
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
```

When leaving the Projects section and returning later, either behavior is acceptable:

- Reset to grid on close.
- Preserve selected project while the section stays mounted.

Preferred:

- Reset selected project when Projects is opened fresh, if simple.
- Always let Back return to the grid.

## CSS Direction

Add project-specific classes in `panel.css`, near the About section styles or after them.

Suggested class names:

- `.projects-body`
- `.projects-intro`
- `.projects-grid`
- `.project-tile`
- `.project-tile__media`
- `.project-tile__cloud`
- `.project-tile__glyph`
- `.project-tile__copy`
- `.project-detail`
- `.project-detail__back`
- `.project-detail__hero`
- `.project-detail__glyph`
- `.project-detail__sections`
- `.project-detail__section`
- `.project-media`
- `.project-links`

Reuse About styling ideas:

- `border-radius: 6px` or less.
- Hard bevel gradients.
- Dither/scanline overlay pseudo-elements.
- `backdrop-filter`.
- Compact uppercase labels.
- Visible focus rings.
- Text shadows that improve readability without making copy blurry.

Tile media:

- Fixed aspect ratio, likely `16 / 10` or `4 / 3`.
- Cloud image should cover the frame.
- Add a dark green glass/tint overlay.
- Glyph should sit centered, large, luminous, and mask-rendered.
- Use `image-rendering` carefully; don't pixelate screenshots unless it improves the visual.

Mobile:

- One-column grid.
- Detail view stacks cleanly.
- Back button stays near the top of detail.
- Buttons/links must not overflow.
- Text must not overlap media or decorative glyphs.

## Responsive Rules

Desktop:

- 2-column grid.
- Detail view uses a single-column inspection layout inside the panel.
- Screenshot frames can be large enough to read.

Mobile:

- 1-column grid.
- No hover-only affordances.
- Detail hero and screenshots stack.
- Keep tile text compact but readable.
- Avoid sticky elements unless tested carefully inside the slide-up panel.

## Implementation Checklist

- [ ] Add project data for all 7 projects.
- [ ] Add Projects-specific body rendering.
- [ ] Add grid state and selected detail state.
- [ ] Add reusable tile component.
- [ ] Add reusable detail component.
- [ ] Add cloud + glyph media treatment.
- [ ] Add screenshot rendering only when screenshots exist.
- [ ] Add GitHub links only where known.
- [ ] Omit link UI entirely for projects without links.
- [ ] Omit screenshot UI entirely for projects without screenshots.
- [ ] Source project glyphs from mayaglyphs.org and save them locally.
- [ ] Add attribution/source notes if practical.
- [ ] Verify desktop panel layout.
- [ ] Verify mobile slide-up layout.
- [ ] Verify keyboard navigation and focus styles.
- [ ] Run existing tests.
- [ ] Start dev server and inspect visually.

## Visual QA

Before finalizing implementation:

- Run the dev server.
- Capture/check desktop and mobile screenshots.
- Confirm the project grid is not cramped.
- Confirm no text overlaps glyphs or screenshots.
- Confirm all buttons fit their containers.
- Confirm detail view scrolls comfortably on mobile.
- Confirm screenshots render only where available.
- Confirm Projects still uses green accent and does not become a multicolor theme.
- Confirm About behavior has not regressed.

## Notes From Planning Conversation

Decisions made:

- The Projects section should be a game-inventory-style grid.
- It should remain stylistically aligned with About but distinct.
- It should use the same green accent throughout.
- It should use cloud photo fragments as project backgrounds.
- It should overlay fitting Mayan/glyph-style symbols.
- The user is comfortable with using glyphs from the same website as existing assets.
- Screenshots should appear where available and be omitted where not.
- Links should appear where available and be omitted where not.
- No unfinished/private status UI should exist because projects will be publish-ready before launch.
- Ephemera should be split into two separate top-level projects: Web Platform and AI Talent Agent.
- AI inbox image belongs to AI Talent Agent.
- Landing page image belongs to Ephemera Web Platform.
- Omarchy image belongs to Omarchy Avocado Theme.
- The Python project from the resume is AI Fraud Detection System, and it was Evan's final project for college.
- PartyPredict was added as a new project after the initial list.
- Use one reusable component/data model for all projects.
