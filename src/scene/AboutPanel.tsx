import { useState, type ReactNode } from 'react'
import { ABOUT_MODES, ABOUT_TOOL_GROUPS, type AboutMode } from './panelData'

export function AboutPanelBody({ closeButton }: { closeButton: ReactNode }) {
  const [activeMode, setActiveMode] = useState<AboutMode>('profile')
  const mode = ABOUT_MODES[activeMode]

  return (
    <div className="about-body">
      <div className="about-content">
        <div className="about-header">
          {closeButton}
          <div className="about-topbar">
            <nav className="about-readout" aria-label="About profile selector">
              <div className="about-switcher" role="group" aria-label="About profile view">
                {(Object.keys(ABOUT_MODES) as AboutMode[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="about-switcher__button"
                    aria-pressed={activeMode === id}
                    onClick={() => setActiveMode(id)}
                    data-interactive
                  >
                    <span className="about-switcher__chev" aria-hidden="true">
                      ▸
                    </span>
                    <span className="about-switcher__label" data-text={ABOUT_MODES[id].label}>
                      {ABOUT_MODES[id].label}
                    </span>
                    <span className="about-switcher__stripe" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        <section
          key={`about-profile-${activeMode}`}
          className="about-profile"
          aria-labelledby="about-profile-name"
          data-about-mode={activeMode}
        >
          <div className="about-profile__media">
            <img key={mode.image} className="about-profile__image" src={mode.image} alt={mode.alt} />
          </div>

          <div className="about-profile__copy">
            <p className="about-profile__eyebrow">
              <span>EVAN RAMIREZ-KLEM</span>
              <span aria-hidden="true">·</span>
              <span>evanklem2004@gmail.com</span>
            </p>
            <h3 id="about-profile-name" className="about-profile__headline">
              {mode.headline}
            </h3>
            <p className="about-profile__intro">{mode.intro}</p>

            <div className="about-actions" aria-label="About links">
              <a
                className="about-action"
                href="/EvanRamirezKlemResume.pdf"
                target="_blank"
                rel="noreferrer"
                data-interactive
              >
                Resume
              </a>
              <a
                className="about-action"
                href="mailto:evanklem2004@gmail.com"
                aria-label="Email Evan Ramirez-Klem"
                data-interactive
              >
                Email
              </a>
              <a
                className="about-action"
                href="https://github.com/evanklem"
                target="_blank"
                rel="noreferrer"
                data-interactive
              >
                GitHub
              </a>
              <a
                className="about-action"
                href="https://www.linkedin.com/in/evanklem"
                target="_blank"
                rel="noreferrer"
                data-interactive
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        <AboutModeContent key={`about-mode-${activeMode}`} activeMode={activeMode} />
      </div>
    </div>
  )
}

function AboutModeContent({ activeMode }: { activeMode: AboutMode }) {
  if (activeMode === 'profile') {
    return (
      <div className="about-grid about-grid--single">
        <section className="about-card about-card--wide" aria-labelledby="about-overview-title">
          <h4 id="about-overview-title" className="about-card__title">
            Overview
          </h4>
          <p>
            My background includes leading development at an early-stage AI startup, where I turned
            founder direction and talent feedback into working software used by onboarded users,
            investor demo accounts, and the founding team.
          </p>
          <p>
            I’m not too fussy about the shape of the work. I’m happy moving between UI, backend
            details, cleanup, edge cases, business rules, and feedback rounds. Give me enough
            context, time, and feedback, and I can build great software.
          </p>
          <p>
            Outside of work, I’m into Linux, customizing my setup, creative software, and games.
            Lately that mostly means Adobe apps, Blender, FL Studio, and Overwatch.
          </p>
        </section>
      </div>
    )
  }

  if (activeMode === 'work') {
    return (
      <div className="about-grid">
        <section className="about-card about-card--tools" aria-labelledby="about-tools-title">
          <h4 id="about-tools-title" className="about-card__title">
            Tools
          </h4>
          <div className="about-tools">
            {ABOUT_TOOL_GROUPS.map(([group, tools]) => (
              <div key={group} className="about-tool-row">
                <span className="about-tool-row__label">{group}</span>
                <span className="about-tool-row__items">
                  {tools.map((tool) => (
                    <span key={tool} className="about-chip">
                      {tool}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-card" aria-labelledby="about-experience-title">
          <h4 id="about-experience-title" className="about-card__title">
            Experience
          </h4>
          <p>
            At Ephemera, I executed the coding work needed across the platform during my tenure as
            the sole developer on a pre-seed AI product. I built demos, admin tools, product flows,
            backend systems, email infrastructure, and billing pieces so the product was ready for
            users, investors, and cofounder reviews during short, hard sprints.
          </p>
          <p>
            Before that, I evaluated AI outputs on Java and computer-science problems for Uber AI
            Solutions, checking accuracy, reasoning, edge cases, and implementation quality while
            completing my BSCS at WGU.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="about-grid about-grid--single">
      <section className="about-card about-card--wide" aria-labelledby="about-setup-title">
        <h4 id="about-setup-title" className="about-card__title">
          Workflow
        </h4>
        <p>
          I like Linux because open source matters to me, and the workflow feels better once you
          get it set up. Hyprland lets me use a keyboard-driven desktop that feels fast and
          personal. JetBrains is my IDE because its Linux support is solid. Claude Code is my daily
          driver. I use agentic coding a lot, and I’m very comfortable building with it. It has
          become my favorite way to work.
        </p>
        <p>
          I also built Evanflow, an open-source Claude Code workflow system that grew out of my
          process while building Ephemera. It packages test-driven development and iterative
          feedback cycles into a repeatable agent workflow for planning, implementation, testing,
          review, and refinement. It has nearly 400 GitHub stars.
        </p>
      </section>
    </div>
  )
}
