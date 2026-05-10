# About Section Body Spec

Date: 2026-05-05  
Project: `/home/klemlitos/Dev/surf`  
Scope: About body inside the existing `SectionPanel`

## Goal

Design and implement the About section body from scratch. The result should feel like a polished retro profile interface: PS1-inspired, liminal old-web, pink glass, readable, intentional, and grounded in Evan's actual work.

This spec is meant to survive context clearing. It captures the design questioning, content decisions, layout requirements, interaction model, and implementation boundaries.

## Files To Touch

Prefer keeping changes scoped to:

- `src/scene/SectionPanel.tsx`
- `src/styles/panel.css`

Do not touch broader scene/navigation behavior unless absolutely necessary.

Preserve:

- Existing panel shell.
- Existing slide-in behavior.
- Existing title rendering.
- Existing close/back behavior.
- Existing placeholder behavior for `Projects`, `Art`, and `Guestbook`.
- Only `About` should get the custom body.

## Existing Context

Current `SectionPanel.tsx` renders a shared lorem-style placeholder body for all sections. The About section accent color comes from `src/scene/regions.ts`:

```ts
{ id: 'about', objectAngle: 0, accentColor: '#ff3a8a' }
```

The existing panel already has:

- Frosted dark glass.
- Pink accent for About.
- PSX/dither texture.
- Mono/display type.
- Slide-in desktop panel from the right.
- Slide-up mobile panel with scroll.

The About body should use this system instead of fighting it.

## Hard No

Do not use:

- Scattered desktop windows.
- Overlapping window collage layouts.
- Fake draggable windows.
- Text covered by decorative elements.
- Tiny unreadable terminal text.
- Heavy glitch effects.
- Skill bars/stats meters.
- Too many fake labels like `LOAD_01`, `PROFILE.DATA`, etc.
- Corporate resume voice.
- AI hype voice.
- Generic portfolio cliches.
- A full resume dump.
- `/content/about/selfpfp2silly.png`.

## Assets

Allowed:

- `/content/about/selfpfp.png`
- `/content/about/selpfp3cute.png`
- `/content/about/computerrv.png`

Forbidden:

- `/content/about/selfpfp2silly.png`

Image roles:

- `selfpfp.png`: main profile image. This should be the default visual.
- `computerrv.png`: setup/open-source/Linux image. Tie it to FOSS, Omarchy, RGB desk setup, and personal computing taste.
- `selpfp3cute.png`: optional secondary/personal image. Use only if it fits naturally. It should not dominate the layout or make the page feel less polished.

## Audience

Primary audience:

- Startups.
- AI product people.
- Founders or teams looking for a product-minded full-stack engineer.

Secondary audience:

- Recruiters, but the design should not become recruiter-first or LinkedIn-like.

The page should make Evan seem like someone who can build real AI products quickly and with taste.

## Core Takeaway

After 20 seconds, the visitor should believe:

- Evan has good taste.
- Evan can build AI products fast.
- Evan can own a product end to end across product decisions, interface details, and backend systems.
- Evan is not just "an AI guy"; he is a full-stack engineer who works across AI product surfaces, systems, and design.

Lead identity:

> Full-stack engineer building AI products end-to-end.

## Tone

Tone should be:

- First-person.
- Dry but compelling.
- Grounded.
- Confident.
- Warm and understated.
- Conversational.
- Specific enough to feel real.

Avoid:

- Corporate resume voice.
- AI hype voice.
- Buzzwords.
- Forced quips.
- Overly poetic/abstract copy.
- "Passionate about leveraging cutting-edge..." style phrasing.

The line "I build AI systems with taste." should feel deadpan, confident, warm, and understated.

## Content Priorities

Must include:

- Main opener: `I build AI systems with taste.`
- Evan is a full-stack engineer building AI products end-to-end.
- Experience jumping between product decisions, interface details, and backend work.
- Ephemera as the main credibility anchor.
- Ephemera was a real job / company context, not just a side project.
- Evan was the sole developer on a pre-seed AI product.
- Evan owned work from user-facing flows to backend systems.
- WGU BSCS, briefly.
- AI QA/RLHF work at Uber AI Solutions, briefly and smaller than Ephemera.
- FOSS/open-source values.
- Linux and Omarchy as part of Evan's personal computing taste.
- Evanflow, explained enough that a stranger understands what it is.
- Evanflow has 350+ GitHub stars as of May 2026.
- Resume CTA opening `/EvanRamirezKlemResume.pdf` in a new tab.
- Email, GitHub, and LinkedIn links.

Should include, but lightly:

- Clean and functional UI.
- Simple interfaces that work because edge cases and conflicting interactions are considered.
- AI workflows used to build AI products.
- Fast iteration across engineering, design, and product sense.
- User control and inspectable/open systems.

Do not go deep on:

- Individual project details. The Projects section will cover them.
- Full cert list.
- Fraud detection project, unless there is a future reason.
- Freelance video editing.
- Phone/location/relocation.

## Content Guidance From Portfolio Research

Useful current convention for portfolio About sections:

- Make the role obvious fast.
- Use first person for personal portfolios.
- Keep bio copy short and specific.
- Show concrete proof without copying the whole resume.
- Include a real image.
- Include resume/contact CTAs.
- Group skills by domain rather than showing fake percentages or skill bars.
- Keep mobile simple and scannable.
- Avoid generic claims and over-written corporate language.

Sources checked during planning:

- ShowProof developer portfolio checklist.
- Wix portfolio About page guide.
- DesignMonks About page best practices.
- GeeksforGeeks developer portfolio contents.
- UXfolio/UX portfolio guidance.

These sources support a medium-short About section: one strong opener, a short first-person bio, a few proof points, a compact tools area, and clear CTAs.

## Visual Direction

Target mix:

- PS1 profile/save-screen inspiration.
- Liminal old-web shrine.
- Pink/red About accent.
- Dark tinted frosted glass.
- Current site visual system.

This should not become a literal game UI. PS1 is inspiration for framing, spacing, pixel/dither treatment, and image presentation, not for gimmicky labels.

Visual qualities:

- Structured.
- Intentional.
- Medium density.
- Scannable.
- Glassy.
- Retro.
- Slightly liminal.
- Pinkish red dominant.
- Subtle cyan/blue highlights are allowed if they come naturally from image colors or hover states.

Avoid:

- Chaotic layout.
- Excess decorative chrome.
- Too much pink saturation.
- Too many borders.
- Fake terminal nonsense.

## Layout Direction

Chosen direction:

> Old-web profile page presented like a clean PS1-inspired profile screen.

Not chosen:

- Desktop window collage.
- Dense terminal/manual.
- Literal RPG character stats.
- Generic profile card.
- Corporate bio panel.

Desktop should have strong structure. Mobile should collapse into stacked cards with no overlap and readable controls.

## Proposed Desktop Wireframe

Inside the existing panel body, below the current `ABOUT` title and rule:

```text
ABOUT

┌──────────────────────────────────────────────────────────────┐
│ EVAN RAMIREZ-KLEM                                             │
│                                                              │
│ ┌──────────────────────┐  I build AI systems with taste.     │
│ │                      │                                      │
│ │  selfpfp.png          │  I’m a full-stack engineer building │
│ │  PS1-ish profile      │  AI products end-to-end with        │
│ │  image frame          │  experience jumping between product │
│ │                      │  decisions, interface details, and   │
│ └──────────────────────┘  backend work.                      │
│                                                              │
│ [Open Resume]  [Email] [GitHub] [LinkedIn]                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [Profile] [Work] [Setup]                                     │
│                                                              │
│ Selector changes one stable details/readout area and image   │
│ emphasis. No layout shift.                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐ ┌─────────────────────────────┐
│ Preview / readout             │ │ Tools                       │
│                               │ │                             │
│ image changes based on        │ │ Frontend                    │
│ selector/hover:               │ │ React / TypeScript /        │
│ - profile: selfpfp            │ │ Tailwind                    │
│ - work: selfpfp or goat       │ │                             │
│ - setup: computerrv           │ │ Backend                     │
│                               │ │ Postgres / auth / payments  │
│ readout sentence              │ │ / email                     │
│                               │ │                             │
│                               │ │ AI systems                  │
│                               │ │ LLMs / agent pipelines /    │
│                               │ │ automation                  │
└──────────────────────────────┘ └─────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ History / proof                                               │
│                                                              │
│ Recently graduated with a BSCS from WGU after shipping at     │
│ Ephemera.                                                     │
│                                                              │
│ At Ephemera, I was the sole developer on a pre-seed AI        │
│ product, owning everything from user-facing flows to backend  │
│ systems. Before that, I reviewed coding and software          │
│ reasoning outputs for Uber AI Solutions.                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Setup / open source                                           │
│                                                              │
│ I like Linux, FOSS, RGB-lit desk setups, and interfaces that  │
│ stay simple because someone thought through the weird parts.  │
│ I run Omarchy Linux as my main environment and made a theme   │
│ for it on GitHub.                                             │
│                                                              │
│ I recently released Evanflow, a Claude workflow I developed   │
│ while building Ephemera. It turns the parts that worked for   │
│ me into a repeatable pipeline, influenced by agent workflows  │
│ and frontier research. It has 350+ stars on GitHub as of     │
│ May 2026.                                                     │
└──────────────────────────────────────────────────────────────┘
```

The actual implementation should be more polished than this ASCII structure. The wireframe is about information hierarchy.

## Proposed Mobile Wireframe

Mobile should stack with no overlap:

```text
ABOUT

[EVAN RAMIREZ-KLEM]
[profile image]
[opener + one short paragraph]
[Open Resume primary]
[Email] [GitHub] [LinkedIn]

[Profile] [Work] [Setup]
[stable readout / optional preview image]

[Tools]
[History]
[Setup/open source]
```

Mobile rules:

- Keep selector readable.
- If selector becomes cramped, use three equal buttons or a horizontal segmented control.
- No tiny text.
- No side-by-side columns below roughly 900px.
- Maintain scroll comfort inside existing mobile panel. The mobile About body does not need to fit in one viewport; it may extend downward and scroll like a longer profile page inside the slide-up panel.
- Use compact card spacing and fixed media dimensions so the longer mobile layout still feels intentional instead of loose.
- Do not rely on hover-only interactions on touch devices.

## Interaction Model

Use a simple selector:

- `Profile`
- `Work`
- `Setup`

These are real `button` elements.

Purpose:

- Add cool interaction without making core content inaccessible.
- Preserve stable layout.
- Support keyboard focus naturally.
- Avoid tabs if tabs feel too formal. This is more like a segmented profile selector.

Recommended behavior:

- All important text remains visible somewhere on the page.
- Selector changes a compact readout/details area and/or the preview image.
- Selector/readout content should stay short and should not be the only place a core credibility claim appears.
- No layout jumps.
- Use `aria-pressed` or another appropriate accessible state.
- Use visible focus styles.
- On desktop, hovering/focusing related cards may also update the preview image if implementation stays simple and predictable.
- On mobile, click/tap selector should work; hover behavior is irrelevant.

Selector content:

- `Profile`: self portrait. Readout: "Full-stack engineer building AI products end-to-end."
- `Work`: work-oriented readout. Image can stay `selfpfp.png` or use `selpfp3cute.png` if it fits. Readout: "Sole developer on a pre-seed AI product at Ephemera."
- `Setup`: laptop image. Readout: "Linux, FOSS, Omarchy, Claude Code, and a custom workflow called Evanflow."

Do not refer to Evanflow without context. The readout may say "a custom Claude Code workflow called Evanflow" rather than just "Evanflow."

## Image Interaction

The user was initially unsure what "image switching" meant, then liked hover/focus image changes if they are done well.

Good implementation:

- The image frame has fixed dimensions.
- Image changes fade smoothly.
- No layout shift.
- The active selector controls the image.
- Hover/focus over related cards can temporarily preview associated images on desktop.

Suggested mapping:

- Default/Profile: `/content/about/selfpfp.png`
- Work: `/content/about/selfpfp.png` or `/content/about/selpfp3cute.png`; choose based on fit during implementation.
- Setup/Open source/Linux: `/content/about/computerrv.png`
- Personal note: `/content/about/selpfp3cute.png`, optional.

If `selpfp3cute.png` makes the design feel less intentional, omit it or keep it as a very small secondary thumbnail.

## Tools / Stack

Use grouped chips or compact rows. Avoid a giant chip cloud if it feels noisy.

Chosen groups:

- Frontend: React, TypeScript, Tailwind
- Backend: Postgres, auth, payments, email
- AI systems: LLMs, agent pipelines, automation

Notes:

- This intentionally condenses resume items.
- Do not list every technology from the resume.
- Avoid redundancy like listing Supabase and Postgres if one clearer category works better.
- Avoid overly specific infrastructure details like Google Pub/Sub unless relevant to a project detail later.

Interactivity:

- If chips link to the Projects section later, they can be clickable.
- Because Projects is currently placeholder, avoid fake/broken links.
- For first implementation, chips can be non-link elements with hover/focus polish or buttons only if they perform a real action.

## CTAs

Include:

- `Open Resume`
- Email
- GitHub
- LinkedIn

CTA hierarchy:

- `Open Resume` is primary, but not overwhelmingly larger than the others.
- Email/GitHub/LinkedIn are secondary.

Resume behavior:

- Link to `/EvanRamirezKlemResume.pdf`.
- Open in a new tab.
- Use `target="_blank"` and `rel="noreferrer"`.

External profile link behavior:

- GitHub and LinkedIn should also open in a new tab.
- Use `target="_blank"` and `rel="noreferrer"` for both.

Email convention:

- Use `mailto:evanklem2004@gmail.com`.
- Make the email readable or discoverable.
- A good pattern for this design: the button says `Email`, and a small status/readout line can show `evanklem2004@gmail.com` on hover/focus.
- Do not rely on hover alone for email discoverability on touch devices. Use a readable persistent line, descriptive `aria-label`, or another accessible non-hover treatment.
- Do not build copy-to-clipboard unless there is time and it is polished/accessibly announced. Mailto is conventional.

LinkedIn:

- Resume lists `www.linkedin.com/in/evanklem`.
- Use `https://www.linkedin.com/in/evanklem`.

GitHub:

- Use `https://github.com/evanklem`.
- Do not leave a broken placeholder in final implementation.

## Copy Draft

Use this as starting copy. It can be tightened during implementation, but preserve meaning and tone.

### Main Profile

```text
I build AI systems with taste.

I’m a full-stack engineer building AI products end-to-end with experience jumping between product decisions, interface details, and backend work.
```

### History / Proof

```text
Recently graduated with a BSCS from WGU after shipping at Ephemera.

At Ephemera, I was the sole developer on a pre-seed AI product, owning everything from user-facing flows to backend systems. Before that, I reviewed coding and software reasoning outputs for Uber AI Solutions.
```

### Setup / Open Source

```text
I like Linux, FOSS, RGB-lit desk setups, and interfaces that stay simple because someone thought through the weird parts. I run Omarchy Linux as my main environment and made a theme for it on GitHub.

I recently released Evanflow, a Claude workflow I developed while building Ephemera. It turns the parts that worked for me into a repeatable pipeline, influenced by agent workflows and frontier research. It has 350+ stars on GitHub as of May 2026.
```

Potential issue:

- The Evanflow paragraph is long. Consider splitting it visually into a smaller note/card or trimming:

```text
I recently released Evanflow, a Claude workflow I developed while building Ephemera. It turns what worked for me into a repeatable build pipeline, influenced by agent workflows and frontier research. It has 350+ stars on GitHub as of May 2026.
```

## Suggested Component Structure

In `SectionPanel.tsx`:

- Keep existing constants.
- Add About-specific component or render helper:
  - `AboutPanelBody`
  - Local state: active profile mode, e.g. `'profile' | 'work' | 'setup'`
  - Data array for modes.
- Render existing placeholder `p.panel__body` for non-About sections.
- For About, render a custom container instead of `p.panel__body`.

Pseudo-structure:

```tsx
function AboutPanelBody() {
  const [activeMode, setActiveMode] = useState<'profile' | 'work' | 'setup'>('profile')
  const mode = ABOUT_MODES[activeMode]

  return (
    <div className="about-body">
      <section className="about-hero">
        ...
      </section>
      <div className="about-selector" role="group" aria-label="About profile view">
        ...
      </div>
      <section className="about-grid">
        ...
      </section>
    </div>
  )
}
```

Accessibility:

- Buttons must be keyboard focusable.
- Use `aria-pressed` for selector buttons.
- Images should have meaningful alt text or empty alt if decorative.
- CTA links need readable labels.
- Ensure focus states are visible against pink/dark glass.
- This spec does not require a full dialog focus-trap refactor. If adding focus trapping, Escape-to-close, or initial-focus behavior, treat that as a separate panel accessibility task unless it is very small and does not disturb existing navigation.

## CSS Direction

Add About-specific classes in `panel.css`, near existing `.panel__body` styles or after them.

Suggested naming:

- `.about-body`
- `.about-profile`
- `.about-profile__media`
- `.about-profile__image`
- `.about-profile__copy`
- `.about-actions`
- `.about-action`
- `.about-action--primary`
- `.about-switcher`
- `.about-switcher__button`
- `.about-readout`
- `.about-grid`
- `.about-card`
- `.about-card--tools`
- `.about-tools`
- `.about-tool-row`
- `.about-chip`

Visual style:

- Reuse current `--accent`.
- Use `color-mix()` consistent with existing `panel.css`.
- Dark translucent cards.
- 6px or smaller border radius to match existing style.
- Pink/red accent borders, subtle inner highlights.
- Dither/scanline overlay may be used, but do not impair text.
- Strong PS1-ish image frame: crisp border, pixelated image rendering if it looks good, dark inset, fixed aspect ratio.
- Balanced between frosted glass and flat PS1 menu.

Animation:

- Subtle hover/focus.
- Selector state fade.
- Image fade if practical.
- No intense glitching.
- No layout movement.

Responsive:

- Desktop: structured grid, likely two columns for middle content.
- Mobile: single column stacked cards.
- No overlap.
- No tiny text.
- Ensure CTA row wraps cleanly.
- Ensure selector buttons remain tappable.

## Visual Hierarchy

Recommended hierarchy:

1. `EVAN RAMIREZ-KLEM` + main opener + image.
2. CTAs.
3. Selector/readout.
4. Tools scan block.
5. History/proof.
6. Setup/open-source note.

Tools before history is acceptable if it scans cleanly and does not weaken the story. If the implementation feels awkward, place tools in a side card beside the readout and put history below.

## Open Questions For Implementer

These are allowed implementation judgment calls:

- Whether `selpfp3cute.png` is included. It is optional.
- Whether Work mode uses `selfpfp.png` or `selpfp3cute.png`.
- Whether tools are rows or chips, depending on available width.
- Whether hover over cards updates the preview, as long as selector remains the primary interaction.

These are not open:

- Do not use overlapping desktop windows.
- Do not use `/content/about/selfpfp2silly.png`.
- Do not make it corporate.
- Do not deep-dive into projects.
- Do not make fake/broken interactions.
- Keep mobile readable and stacked.

## Verification Checklist

Run after implementation:

```bash
npm run lint
npm run build
npm run test:run
```

Recommended visual checks:

- Start local Vite dev server.
- Take desktop screenshot of About panel.
- Take mobile screenshot of About panel.
- Check:
  - No overlap.
  - No tiny unreadable UI.
  - Text is readable.
  - CTAs wrap correctly.
  - Selector focus/hover states are visible.
  - Image frame is intentional.
  - Mobile scroll is comfortable.
  - About custom body only appears for About.
  - Other sections still show placeholder behavior.

## Summary

The About section should feel like Evan's profile page in a weird, polished old computer interface: pink glass, PS1-adjacent framing, old-web personality, and real product credibility. The page should say, without sounding like a resume, that Evan is a full-stack engineer who can build AI products end-to-end, has shipped in a pre-seed startup environment, cares about clean functional interfaces, and has a real personal relationship with open-source/Linux/AI workflows.
