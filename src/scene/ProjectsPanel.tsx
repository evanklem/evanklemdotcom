import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PROJECTS, prefersSingleTapOpen, type Project } from './panelData'

export function ProjectsPanelBody({
  closeButton,
  panelOpen,
}: {
  closeButton: ReactNode
  panelOpen: boolean
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [expandedMediaSrc, setExpandedMediaSrc] = useState<string | null>(null)
  const selectedProject = PROJECTS.find((project) => project.id === selectedProjectId)

  if (selectedProject) {
    const expandedScreenshot = selectedProject.screenshots?.find(
      (screenshot) => screenshot.src === expandedMediaSrc,
    )
    const detailBackButton = (
      <button
        type="button"
        onClick={() => {
          setExpandedMediaSrc(null)
          setSelectedProjectId(null)
        }}
        aria-label="Back to projects"
        className="about-back"
        data-interactive
      >
        <span className="about-back__arrow" aria-hidden="true">
          ←
        </span>
        <span className="about-back__copy">
          <span className="about-back__label">Back</span>
        </span>
      </button>
    )

    return (
      <div
        key={`project-detail-${selectedProject.id}`}
        className="projects-body projects-body--detail"
      >
        {detailBackButton}
        <ProjectDetailTopper project={selectedProject} />
        <div className="projects-content">
          <ProjectDetail project={selectedProject} onExpandMedia={setExpandedMediaSrc} />
        </div>
        {expandedScreenshot &&
          createPortal(
            <div className="project-media-expanded" aria-label="Expanded project screenshot">
              <div className="project-media-expanded__surface">
                <img src={expandedScreenshot.src} alt={expandedScreenshot.alt} />
              </div>
              <button
                type="button"
                className="project-media-expanded__close"
                onClick={() => setExpandedMediaSrc(null)}
                data-interactive
              >
                Close image
              </button>
            </div>,
            document.body,
          )}
      </div>
    )
  }

  return (
    <div className="projects-body">
      {closeButton}
      <section className="projects-content" aria-label="Project browser">
        <p className="projects-intro">
          End-to-end projects I designed, built, and shipped across product, interface, backend
          systems, AI workflows, and tooling.
        </p>
        {panelOpen && <ProjectGrid onSelect={(projectId) => setSelectedProjectId(projectId)} />}
      </section>
    </div>
  )
}

function ProjectGrid({ onSelect }: { onSelect: (projectId: string) => void }) {
  const [gridReady, setGridReady] = useState(false)
  const [visibleProjectCount, setVisibleProjectCount] = useState(0)

  useEffect(() => {
    const delay = prefersSingleTapOpen() ? 360 : 80
    const id = window.setTimeout(() => {
      setGridReady(true)
    }, delay)

    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!gridReady) return

    let nextCount = 0
    const id = window.setInterval(() => {
      nextCount += 1
      setVisibleProjectCount(nextCount)
      if (nextCount >= PROJECTS.length) window.clearInterval(id)
    }, 55)

    return () => window.clearInterval(id)
  }, [gridReady])

  if (!gridReady) return null

  return (
    <div className="projects-grid">
      {PROJECTS.slice(0, visibleProjectCount).map((project) => (
        <ProjectTile key={project.id} project={project} onSelect={() => onSelect(project.id)} />
      ))}
    </div>
  )
}

function ProjectTile({ project, onSelect }: { project: Project; onSelect: () => void }) {
  return (
    <button type="button" className="project-tile" onClick={onSelect} data-interactive>
      <span className="project-tile__media" aria-hidden="true">
        <img
          className="project-tile__cloud"
          src={project.cloud}
          alt=""
          loading="eager"
          decoding="async"
        />
        <span
          className="project-tile__glyph"
          style={{ ['--project-glyph' as string]: `url('${project.glyph}')` }}
        />
      </span>
      <span className="project-tile__copy">
        <span className="project-tile__category">{project.category}</span>
        <span className="project-tile__name">{project.name}</span>
        <span className="project-tile__line">{project.tileLine}</span>
        <span className="project-tile__meta">{project.meta}</span>
      </span>
    </button>
  )
}

function ProjectDetailTopper({ project }: { project: Project }) {
  return (
    <header className="project-detail-topper" aria-labelledby={`project-${project.id}-title`}>
      <p className="project-detail__eyebrow">
        <span>{project.category}</span>
        <span aria-hidden="true">/</span>
        <span>{project.meta}</span>
      </p>
      <h3 id={`project-${project.id}-title`} className="project-detail__title">
        {project.name}
      </h3>
    </header>
  )
}

function ProjectDetail({
  project,
  onExpandMedia,
}: {
  project: Project
  onExpandMedia: (src: string) => void
}) {
  const overview = project.sections.find((section) => section.title === 'Overview')?.body
  const built = project.sections.find((section) => section.title === 'Built')?.body
  const remainingSections = project.sections.filter(
    (section) => section.title !== 'Overview' && section.title !== 'Built',
  )

  return (
    <article className="project-detail" aria-labelledby={`project-${project.id}-title`}>
      <div className="project-detail__overview">
        <div className="project-detail__hero" aria-hidden="true">
          <img
            className="project-detail__cloud"
            src={project.cloud}
            alt=""
            loading="eager"
            decoding="async"
          />
          <span
            className="project-detail__glyph"
            style={{ ['--project-glyph' as string]: `url('${project.glyph}')` }}
          />
        </div>

        <div className="project-detail__copy">
          {project.quickRead && (
            <aside className="project-detail__quick" aria-label={`${project.name} quick read`}>
              <span>Overview</span>
              <p>{project.quickRead}</p>
            </aside>
          )}
          <section
            className="project-detail__section project-detail__section--lead"
            aria-labelledby={`project-${project.id}-overview`}
          >
            <h4 id={`project-${project.id}-overview`}>
              {project.quickRead ? 'Scope & Implementation' : 'Overview'}
            </h4>
            {!project.quickRead && overview && <p>{overview}</p>}
            {built && <p>{built}</p>}
            {project.links && project.links.length > 0 && (
              <div className="project-detail__inline-links" aria-label={`${project.name} links`}>
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    className="project-link"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    data-interactive
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {project.diagram && <ProjectDiagram project={project} />}

      <div className="project-detail__sections">
        {remainingSections.map((section) => (
          <section
            key={section.title}
            className="project-detail__section"
            aria-labelledby={`project-${project.id}-${section.title.replaceAll(' ', '-').toLowerCase()}`}
          >
            <h4 id={`project-${project.id}-${section.title.replaceAll(' ', '-').toLowerCase()}`}>
              {section.title}
            </h4>
            <p>{section.body}</p>
          </section>
        ))}
      </div>

      {(project.video || (project.screenshots && project.screenshots.length > 0)) && (
        <div className="project-media" aria-label={`${project.name} media`}>
          {project.video && (
            <figure className="project-media__frame project-media__frame--video">
              <video
                className="project-detail__video"
                src={project.video.src}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${project.name} demo video`}
              />
              {project.video.caption && <figcaption>{project.video.caption}</figcaption>}
            </figure>
          )}
          {project.screenshots?.map((screenshot) => (
            <figure key={screenshot.src} className="project-media__frame">
              <button
                type="button"
                className="project-media__expand"
                onClick={() => onExpandMedia(screenshot.src)}
                data-interactive
              >
                <img src={screenshot.src} alt={screenshot.alt} />
                <span>Maximize image</span>
              </button>
              {screenshot.caption && <figcaption>{screenshot.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </article>
  )
}

function ProjectDiagram({ project }: { project: Project }) {
  const diagram = project.diagram

  if (!diagram) {
    return null
  }

  const titleId = `project-${project.id}-diagram`

  if (diagram.kind === 'architecture') {
    return (
      <section className="project-diagram" aria-labelledby={titleId} data-kind={diagram.kind}>
        <h4 id={titleId}>{diagram.title}</h4>
        <svg
          className="project-schematic project-schematic--architecture"
          viewBox="0 0 640 250"
          role="img"
          aria-label="Ephemera web platform architecture"
        >
          <g className="project-schematic__label">
            <text x="20" y="42">FRONTEND</text>
            <text x="20" y="122">API</text>
            <text x="20" y="202">BACKEND</text>
          </g>
          <g className="project-schematic__nodes">
            <rect x="144" y="24" width="130" height="36" rx="3" />
            <text x="209" y="42">React</text>
            <rect x="296" y="24" width="130" height="36" rx="3" />
            <text x="361" y="42">Tailwind</text>
            <rect x="448" y="24" width="130" height="36" rx="3" />
            <text x="513" y="42">TanStack Query</text>

            <rect x="144" y="104" width="130" height="36" rx="3" />
            <text x="209" y="122">tRPC routes</text>
            <rect x="296" y="104" width="130" height="36" rx="3" />
            <text x="361" y="122">Better Auth</text>
            <rect x="448" y="104" width="130" height="36" rx="3" />
            <text x="513" y="122">Stripe</text>

            <rect x="220" y="184" width="130" height="36" rx="3" />
            <text x="285" y="202">Postgres</text>
            <rect x="372" y="184" width="130" height="36" rx="3" />
            <text x="437" y="202">Kysely</text>
          </g>
        </svg>
      </section>
    )
  }

  if (diagram.kind === 'decision') {
    return (
      <section className="project-diagram" aria-labelledby={titleId} data-kind={diagram.kind}>
        <h4 id={titleId}>{diagram.title}</h4>
        <svg
          className="project-schematic project-schematic--decision"
          viewBox="0 0 640 250"
          role="img"
          aria-label="AI talent agent deal pipeline"
        >
          <defs>
            <marker id="agent-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>
          <g className="project-schematic__nodes">
            <rect x="9" y="79" width="110" height="92" rx="4" />
            <text x="64" y="103">Classify</text>
            <text x="64" y="131" className="project-schematic__sub">filter inbound</text>
            <text x="64" y="145" className="project-schematic__sub">for deal inquiries</text>

            <rect x="137" y="79" width="110" height="92" rx="4" />
            <text x="192" y="103">Analyze</text>
            <text x="192" y="131" className="project-schematic__sub">pull deal terms</text>
            <text x="192" y="145" className="project-schematic__sub">from each thread</text>

            <rect x="265" y="79" width="110" height="92" rx="4" />
            <text x="320" y="103">Clarify</text>
            <text x="320" y="131" className="project-schematic__sub">agent replies</text>
            <text x="320" y="145" className="project-schematic__sub">for missing terms</text>

            <rect x="393" y="79" width="110" height="92" rx="4" />
            <text x="448" y="103">Approve</text>
            <text x="448" y="131" className="project-schematic__sub">talent reviews</text>
            <text x="448" y="145" className="project-schematic__sub">or auto-sends</text>

            <rect x="521" y="79" width="110" height="92" rx="4" />
            <text x="576" y="103">Invoice</text>
            <text x="576" y="131" className="project-schematic__sub">bill the brand</text>
            <text x="576" y="145" className="project-schematic__sub">via Stripe</text>
          </g>
          <g className="project-schematic__lines">
            <path d="M119 125 H137" markerEnd="url(#agent-arrow)" />
            <path d="M247 125 H265" markerEnd="url(#agent-arrow)" />
            <path d="M375 125 H393" markerEnd="url(#agent-arrow)" />
            <path d="M503 125 H521" markerEnd="url(#agent-arrow)" />
          </g>
        </svg>
      </section>
    )
  }

  if (diagram.kind === 'system') {
    return (
      <section className="project-diagram" aria-labelledby={titleId} data-kind={diagram.kind}>
        <h4 id={titleId}>{diagram.title}</h4>
        <svg
          className="project-schematic project-schematic--system"
          viewBox="0 0 640 250"
          role="img"
          aria-label="Polypore IDE architecture: the agent drives dockable panels through the MCP server while the user works in the same shell, sharing one workspace"
        >
          <defs>
            <marker id="poly-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>

          <g className="project-schematic__frame">
            <rect x="346" y="20" width="282" height="210" rx="5" />
          </g>
          <g className="project-schematic__callouts">
            <text x="487" y="40">Dockable shell</text>
          </g>

          <g className="project-schematic__nodes">
            <rect x="12" y="83" width="108" height="60" rx="4" />
            <text x="66" y="106">Agent</text>
            <text x="66" y="126" className="project-schematic__sub">primary actor</text>

            <rect x="176" y="83" width="120" height="60" rx="4" />
            <text x="236" y="106">MCP server</text>
            <text x="236" y="126" className="project-schematic__sub">22+ tools</text>

            <rect x="12" y="166" width="108" height="60" rx="4" />
            <text x="66" y="189">User</text>
            <text x="66" y="209" className="project-schematic__sub">shared workspace</text>

            <rect x="366" y="60" width="116" height="66" rx="4" />
            <text x="424" y="93">editor</text>
            <rect x="494" y="60" width="116" height="66" rx="4" />
            <text x="552" y="93">debug</text>
            <rect x="366" y="146" width="116" height="66" rx="4" />
            <text x="424" y="179">memory</text>
            <rect x="494" y="146" width="116" height="66" rx="4" />
            <text x="552" y="179">terminal</text>
          </g>

          <g className="project-schematic__lines">
            <path d="M120 113 H176" markerEnd="url(#poly-arrow)" />
            <path d="M296 113 H346" markerEnd="url(#poly-arrow)" />
            <path d="M120 196 H346" markerEnd="url(#poly-arrow)" />
          </g>
        </svg>
      </section>
    )
  }

  if (diagram.kind === 'loop') {
    return (
      <section className="project-diagram" aria-labelledby={titleId} data-kind={diagram.kind}>
        <h4 id={titleId}>{diagram.title}</h4>
        <svg
          className="project-schematic project-schematic--loop"
          viewBox="0 0 640 260"
          role="img"
          aria-label="Evanflow coding workflow loop"
        >
          <defs>
            <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>
          <path
            className="project-schematic__loop-line"
            d="M 320 30 A 210 110 0 0 1 320 250 A 210 110 0 0 1 320 30"
          />
          <g className="project-schematic__nodes">
            <rect x="264" y="9" width="112" height="42" rx="4" />
            <text x="320" y="30">Brainstorm</text>
            <rect x="464" y="85" width="112" height="42" rx="4" />
            <text x="520" y="106">Plan</text>
            <rect x="387" y="208" width="112" height="42" rx="4" />
            <text x="443" y="229">Execute</text>
            <rect x="141" y="208" width="112" height="42" rx="4" />
            <text x="197" y="229">Review</text>
            <rect x="64" y="85" width="112" height="42" rx="4" />
            <text x="120" y="106">Iterate</text>
          </g>
        </svg>
      </section>
    )
  }

  return (
    <section
      className="project-diagram"
      aria-labelledby={titleId}
      data-kind={diagram.kind}
    >
      <h4 id={titleId}>{diagram.title}</h4>
      {diagram.lanes ? (
        <div className="project-diagram__lanes">
          {diagram.lanes.map((lane) => (
            <div key={lane.label} className="project-diagram__lane">
              <span className="project-diagram__lane-label">{lane.label}</span>
              <div className="project-diagram__lane-items">
                {lane.items.map((item) => (
                  <span key={item} className="project-diagram__node">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="project-diagram__flow">
          {diagram.flow?.map((item, index) => (
            <span key={item} className="project-diagram__step">
              <span>{item}</span>
              {index < (diagram.flow?.length ?? 0) - 1 && (
                <span className="project-diagram__arrow" aria-hidden="true">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
      )}
      {diagram.branches && (
        <div className="project-diagram__branches">
          {diagram.branches.map((branch) => (
            <span key={`${branch.label}-${branch.target}`} className="project-diagram__branch">
              <span>{branch.label}</span>
              <span aria-hidden="true">→</span>
              <span>{branch.target}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
