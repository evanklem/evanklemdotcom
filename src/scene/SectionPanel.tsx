import { useEffect, useState } from 'react'
import { REGIONS } from './regions'
import { useNavState } from './navContext'
import { AboutPanelBody } from './AboutPanel'
import { ArtPanelBody } from './ArtPanel'
import { ProjectsPanelBody } from './ProjectsPanel'
import { GLYPHS, PROJECTS, TITLES } from './panelData'
import '../styles/panel.css'

const FALLBACK_PANEL_COPY = 'Choose another section from the vase navigation to explore the portfolio.'

export function SectionPanel() {
  const { activeRegion, setActiveRegion } = useNavState()
  const open = activeRegion !== null
  const [lastRegionId, setLastRegionId] = useState<string | null>(activeRegion)
  if (activeRegion && activeRegion !== lastRegionId) {
    setLastRegionId(activeRegion)
  }
  const visibleRegionId = activeRegion ?? lastRegionId
  const region = visibleRegionId ? REGIONS.find((r) => r.id === visibleRegionId) : null
  const accent = region?.accentColor ?? '#c4ff00'
  const isAbout = region?.id === 'about'
  const isProjects = region?.id === 'projects'
  const isArt = region?.id === 'art'
  const usesPanelBack = isAbout || isProjects || isArt

  useEffect(() => {
    PROJECTS.forEach((project) => {
      const sources = [project.cloud, project.glyph]

      sources.forEach((src) => {
        const image = new Image()
        image.decoding = 'async'
        image.src = src
      })
    })
  }, [])

  const closeButton = (
    <button
      type="button"
      onClick={() => setActiveRegion(null)}
      aria-label={usesPanelBack ? 'Back to home' : 'Close section'}
      className={usesPanelBack ? 'about-back' : 'panel__close'}
      data-interactive
    >
      {usesPanelBack ? (
        <>
          <span className="about-back__arrow" aria-hidden="true">
            ←
          </span>
          <span className="about-back__copy">
            <span className="about-back__label">Back</span>
          </span>
        </>
      ) : (
        '← BACK'
      )}
    </button>
  )

  return (
    <div
      className="panel"
      data-open={open}
      data-section={region?.id ?? ''}
      role="dialog"
      aria-hidden={!open}
      style={{ ['--accent' as string]: accent }}
    >
      {!usesPanelBack && closeButton}

      {region && (
        <div
          className={`panel__watermark panel__watermark--${GLYPHS[region.id]}`}
          aria-hidden="true"
        />
      )}

      <div className="panel__inner">
        {!isAbout && !isProjects && !isArt && (
          <>
            <h2 className="panel__title" data-text={region ? TITLES[region.id] : ''}>
              {region ? TITLES[region.id] : ''}
            </h2>
            <hr className="panel__rule" />
          </>
        )}
        {isAbout ? (
          <AboutPanelBody closeButton={closeButton} />
        ) : isProjects ? (
          <ProjectsPanelBody closeButton={closeButton} panelOpen={open} />
        ) : isArt ? (
          <ArtPanelBody closeButton={closeButton} />
        ) : (
          <p className="panel__body">{FALLBACK_PANEL_COPY}</p>
        )}
      </div>
    </div>
  )
}
