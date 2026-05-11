import { useNavState } from './navContext'
import { REGIONS } from './regions'
import './VerticalMenu.css'

const SECTION_LABELS: Record<string, string> = {
  about: 'ABOUT',
  projects: 'PROJECTS',
  art: 'ART',
}

const SECTION_GLYPHS: Record<string, string> = {
  about: 'water',
  projects: 'fire',
  art: 'carving',
}

/**
 * Memory-card-slot menu. The glyph floats outside the pill (left), with its
 * own glow. The pill itself is a beveled, dithered slot with an accent
 * stripe down the right edge. Whole row is one button so click-anywhere
 * still toggles the section.
 */
export function VerticalMenu() {
  const { activeRegion, setActiveRegion } = useNavState()
  return (
    <ul className="vmenu" data-active={activeRegion ?? ''} data-hidden={activeRegion !== null}>
      <li
        className="vmenu__item vmenu__brand"
        style={{ ['--curve-x' as string]: '-22px' }}
        aria-hidden="true"
      >
        <span className="vmenu__brand-mark">
          <span className="vmenu__brand-dither" />
        </span>
      </li>
      {REGIONS.map((r, i) => {
        const isActive = r.id === activeRegion
        const center = (REGIONS.length - 1) / 2
        const distFromCenter = Math.abs(i - center)
        const curveOffset = (center - distFromCenter) * 22
        return (
          <li
            key={r.id}
            className={`vmenu__item ${isActive ? 'vmenu__item--active' : ''}`}
            style={{
              ['--curve-x' as string]: `${curveOffset}px`,
              ['--accent' as string]: r.accentColor,
            }}
          >
            <button
              type="button"
              className="vmenu__btn"
              data-interactive
              onClick={() => setActiveRegion(isActive ? null : r.id)}
              aria-pressed={isActive}
              aria-label={SECTION_LABELS[r.id]}
            >
              <span
                className={`vmenu__glyph vmenu__glyph--${SECTION_GLYPHS[r.id]}`}
                aria-hidden="true"
              />
              <span className="vmenu__pill">
                <span className="vmenu__chev" aria-hidden="true">▸</span>
                <span className="vmenu__label" data-text={SECTION_LABELS[r.id]}>
                  {SECTION_LABELS[r.id]}
                </span>
                <span className="vmenu__stripe" aria-hidden="true" />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
