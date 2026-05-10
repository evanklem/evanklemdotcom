# Art Section Body Spec

Date: 2026-05-08  
Project: `/home/klemlitos/Dev/surf`  
Scope: Art body inside the existing `SectionPanel`

## Goal

Replace the generic Art placeholder with a mini Windows XP-inspired desktop archive inside the existing Art panel. The result should feel playful and personal, but still aligned with the About and Projects panels: compact, square, level, dithered, glassy, readable, and intentionally retro.

This spec is meant to survive context clearing. It captures the design questioning, content decisions, assets, interaction model, and implementation boundaries from the planning conversation.

## Files To Touch

Prefer keeping implementation scoped to:

- `src/scene/SectionPanel.tsx`
- `src/styles/panel.css`

Allowed if it materially improves maintainability:

- `src/scene/art.ts` or similar local data file for art definitions.

Do not touch broader scene/navigation behavior unless absolutely necessary.

Preserve:

- Existing panel shell.
- Existing slide-in desktop behavior.
- Existing slide-up mobile behavior.
- Existing Art accent behavior.
- Existing About implementation.
- Existing Projects implementation.
- Project-style expanded image overlay behavior.

## Existing Context

`SectionPanel.tsx` already has custom bodies for About and Projects. Art currently falls through to placeholder text.

The Art section accent color comes from `src/scene/regions.ts`:

```ts
{ id: 'art', objectAngle: Math.PI, accentColor: '#5b3aff' }
```

Use `#5b3aff` as the Art indigo anchor. The user may create a custom Bliss-style wallpaper using this color. If that asset is not present during implementation, use a CSS fallback and keep the asset path easy to swap.

## Hard No

Do not use:

- Another Projects-style card grid.
- A gallery-room arrow navigation system.
- Confusing shared arrow controls.
- Draggable windows.
- Overlapping loose desktop windows.
- A cluttered fake operating system with too many decorative controls.
- Autoplaying audio.
- Audio without manual volume control.
- Tiny unreadable file labels.
- Heavy glitch effects.
- Corporate portfolio voice.
- Overwritten or unrelated About/Projects styling.
- Browser controls hidden in favor of fragile custom video controls.

## Visual Direction

Chosen direction:

> A mini Windows XP desktop/folder environment embedded inside the Art panel.

The Art panel should retain the same structural rhythm as Projects:

- Back button in the same position and style as Projects.
- A top-right box that fills the rest of the top row.
- Main body underneath.

The top-right box should say:

```text
Personal art archive
```

It can also include subtle archive/status treatment if useful, but the visible copy should stay simple and not become a lore-heavy terminal.

The main body underneath is the desktop simulator:

- A contained desktop surface.
- Wallpaper using the Art indigo `#5b3aff`, ideally from a user-created Bliss-style asset.
- A bottom taskbar.
- Six folder icons arranged left-to-right, left-justified.
- Folder layout must account for smaller widths by wrapping proportionally rather than shrinking into unreadable labels.

The whole thing should feel like Windows XP filtered through the existing site:

- XP-like title bars, folder icons, file icons, taskbar, and window chrome.
- Site-native indigo glass, dither, scanlines, hard borders, and compact mono/display type.
- Square and level composition.
- No exact clone that visually fights the portfolio.

## Desktop Layout

Use a body structure similar to Projects:

- Grid column 1: Projects-style back button.
- Grid column 2: top readout box with `Personal art archive`.
- Main desktop surface spans full width below.

Desktop surface:

- Fixed stable aspect ratio or min-height so the layout does not jump.
- Overflow controlled.
- Background wallpaper.
- Folder row starts at top-left.
- Taskbar attached to the bottom of the desktop surface.

Folder layout:

- One horizontal row, left-justified on desktop.
- Wrap to additional rows on narrower screens.
- Keep icon hit targets comfortably clickable.
- Use stable square icon areas so labels do not resize the desktop.

Mobile:

- Back button becomes the existing mobile back button treatment.
- Top readout stacks naturally.
- Desktop surface remains usable in the 75vh panel.
- Folders can wrap into a 2-column or compact grid as needed.
- Open folder/file windows should fill most of the desktop surface without causing horizontal scroll.

## Categories

All six category folders are visible on the first Art screen.

Folder names:

```text
AI SHORTS
3D
DIGITAL PAINTING
PHOTOGRAPHY
SELF PORTRAITS
MUSIC
```

Treat all categories as equal. Do not feature one anchor artwork on the initial screen.

## Asset Grouping

Use this grouping:

- AI SHORTS
  - `/content/art/aishort1.mp4`
  - `/content/art/aishort2.mp4`
- 3D
  - `/content/art/blender1.png`
  - `/content/art/blender2.png`
  - `/content/art/blenderflower.png`
  - `/content/art/blenderphone.png`
- DIGITAL PAINTING
  - `/content/art/digitalpainting.png`
  - `/content/art/digitalpainting2.png`
  - `/content/art/digitalpainting3.png`
- PHOTOGRAPHY
  - `/content/art/photography1.png`
  - `/content/art/photography2.png`
- SELF PORTRAITS
  - `/content/art/selfportrait1.png`
  - `/content/art/selfportrait2.png`
  - `/content/art/selfportrait3.png`
- MUSIC
  - `/content/art/songsample.wav`

Use file-like labels matching the real names:

- `aishort1.mp4`
- `aishort2.mp4`
- `blender1.png`
- `blender2.png`
- `blenderflower.png`
- `blenderphone.png`
- `digitalpainting.png`
- `digitalpainting2.png`
- `digitalpainting3.png`
- `photography1.png`
- `photography2.png`
- `selfportrait1.png`
- `selfportrait2.png`
- `selfportrait3.png`
- `songsample.wav`

## Folder Interaction

Clicking a folder opens a centered fake Windows XP Explorer window inside the desktop surface.

The window:

- Is not draggable.
- Is centered and sized to fill the usable desktop frame.
- Has a fake XP-style title bar.
- Has a close `X` button in the title bar that returns to the desktop.
- Shows files inside the selected folder in a Windows XP-like icon view.
- Has a bottom notes area for the selected/open file description.

The window should not escape the Art panel or become a separate browser modal. It is part of the desktop simulator.

## File Interaction

Favor Windows XP-like behavior while keeping the web implementation easy to use:

- Files appear as icons or thumbnail icons with filename underneath.
- A single click selects a file and updates the bottom notes area.
- Opening a file should be possible by double click and by an explicit `Open`/viewer affordance if needed for accessibility.
- Keyboard focus should be visible.
- Enter should open the selected file when practical.
- Escape can close an open file viewer or folder if simple to implement.

When a file opens:

- The same centered Explorer-style window becomes a viewer/player.
- Title bar shows the filename.
- `X` returns to the folder contents.
- A green maximize control in the top-left/title controls area opens image files in the same project-style expanded image overlay.

For image files:

- Show the image at max useful size inside the viewer.
- Use `object-fit: contain`.
- Provide maximize/fullscreen behavior matching Projects' expanded image overlay, adapted to Art.

For video files:

- Play inline in the viewer.
- Use native browser video controls.
- Include volume through native controls.
- Do not autoplay with sound.
- Looping is acceptable if it feels natural, but native controls must remain available.

For audio:

- `songsample.wav` opens an audio artwork/player.
- Include a spinning CD visualizer in the viewer.
- The disc label should include `songsample.wav`.
- Use native audio controls or simple custom play/pause plus volume. Recommendation: native audio controls for reliability, paired with the custom spinning CD visual.
- Audio must be manual play only.

## Taskbar

Include a small XP-inspired taskbar at the bottom of the desktop surface.

It should:

- Visually ground the desktop metaphor.
- Show the current state, such as `Art Archive`, open folder name, or open filename.
- Be decorative but useful.
- Not introduce extra navigation complexity.
- Stay compact on mobile.

## Description Copy

Tone:

- Casual and personal.
- Minimal and dry.
- No AI-flourishy wording.
- More personal than About/Projects, but still appropriate for a portfolio.

Each file should have a short description, usually 1-3 compact sentences, shown in the bottom notes area when selected or opened.

Content source from user:

- AI shorts: Evan has been into AI generation since he was a teenager experimenting with Stable Diffusion locally before AI became mainstream. He had early access to Sora and made these shorts last year when that model dropped.
- `blender1.png` and `blender2.png`: 3D models made in Blender.
- `blenderflower.png` and `blenderphone.png`: retro low-poly Blender designs inspired by PS1-style looks, retro games, and efficient old game visuals.
- Digital paintings: made in Photoshop using posterization and painting to push toward a more realistic-but-stylized look. My Little Pony is awesome.
- Photography: local Virginia shelf fungus photographed on a recent nature walk. Evan is into fungus and finds them cool.
- Self portraits: multimedia portraits with facial features collaged onto Blender models, then processed in Photoshop. `selfportrait3.png` was specifically made as a stencil for shirt dyeing, which Evan does occasionally.
- Music: made in FL Studio using the Roland TB-303. Evan likes EDM and house, especially Chicago house, which he was raised on. He also used to score music during contract video editing work.

Draft description direction:

- Keep copy specific to the medium and process.
- Mention tools where relevant.
- Avoid long artist-statement language.
- Let the weirdness and personal interests stay understated.

## Suggested Data Shape

Implementation can define an array like:

```ts
type ArtCategory = {
  id: string
  label: string
  files: ArtFile[]
}

type ArtFile = {
  id: string
  filename: string
  src: string
  type: 'image' | 'video' | 'audio'
  description: string
  alt?: string
}
```

Keep data close to `SectionPanel.tsx` unless it makes the file too large. If it gets bulky, move the art data to `src/scene/art.ts`.

## Accessibility

Required:

- Folder and file icons are real buttons.
- Each button has a clear label.
- Selected file state uses `aria-selected` or equivalent when applicable.
- Open file viewer has a useful heading/title based on filename.
- Close/maximize controls have accessible labels.
- Media has meaningful alt text or captions.
- Native video/audio controls remain keyboard-accessible.
- Focus states are visible and consistent with About/Projects.

## Implementation Notes

Reusable styling should borrow from existing patterns:

- `about-back` for the back button.
- Projects top-row/body grid behavior.
- Existing panel card borders, dither overlays, scanlines, and accent color mixing.
- Project expanded image overlay behavior for image maximization.

New likely component functions inside `SectionPanel.tsx`:

- `ArtPanelBody`
- `ArtDesktop`
- `ArtFolderWindow`
- `ArtFileViewer`
- `ArtAudioPlayer`
- `ArtExpandedImage`

State needed:

- `openCategoryId: string | null`
- `selectedFileId: string | null`
- `openFileId: string | null`
- `expandedImageSrc: string | null`

Suggested behavior:

- On desktop load: `openCategoryId = null`.
- On folder click: set category, select first file in that category, show folder window.
- On file click: select file and update notes.
- On file double click or explicit open: open viewer.
- On folder window close: clear open file and selected file, return to desktop.
- On file viewer close: clear open file, keep folder open.
- On expanded image close: return to file viewer.

## Acceptance Criteria

- Art no longer renders placeholder text.
- Art panel keeps the same shell, back button placement, and top-row logic as Projects.
- The initial Art screen shows a mini desktop with all six folders visible.
- Opening a folder shows a centered fake Explorer window with the correct files.
- Selecting files updates a bottom notes area.
- Images open in a contained viewer and can be maximized using project-style overlay behavior.
- Videos play inline with native controls and volume.
- `songsample.wav` opens a manual audio player with a spinning CD visualizer and visible `songsample.wav` label.
- The XP metaphor is clear without hurting readability or mobile usability.
- No audio autoplays.
- No folder/window is draggable.
- About and Projects behavior remain unchanged.
