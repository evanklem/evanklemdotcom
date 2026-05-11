import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { REGIONS } from './regions'
import { useNavState } from './navContext'
import '../styles/panel.css'

const TITLES: Record<string, string> = {
  about: 'About',
  projects: 'Projects',
  art: 'Art',
}

const GLYPHS: Record<string, string> = {
  about: 'water',
  projects: 'fire',
  art: 'carving',
}

const LOREM =
  'Section content lands here once we wire real pages. ' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
  'Spin or click another tile to navigate.'

type AboutMode = 'profile' | 'work' | 'setup'

type ArtFile = {
  id: string
  filename: string
  src: string
  type: 'image' | 'video' | 'audio'
  description: string
  alt?: string
  width?: number
  height?: number
}

function prefersSingleTapOpen() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches
  )
}

type ArtCategory = {
  id: string
  label: string
  icon?: 'folder' | 'recycle'
  files: ArtFile[]
}

const ABOUT_MODES: Record<
  AboutMode,
  {
    label: string
    image?: string
    alt?: string
    headline: string
    intro: string
  }
> = {
  profile: {
    label: 'Profile',
    image: '/content/about/selfpfp.png',
    alt: 'Portrait of Evan Ramirez-Klem',
    headline: 'Full-stack engineer.',
    intro:
      'I build web apps end to end with React, TypeScript, PostgreSQL, and AI workflow tools. I was the sole developer on a pre-seed creator platform and I’m looking for full-time work.',
  },
  work: {
    label: 'Experience',
    image: '/content/about/project-dither.gif',
    alt: 'Animated project interface preview representing Evan’s product work',
    headline: 'Product, interface, systems.',
    intro:
      'I was the sole developer on a pre-seed AI creator platform, building customer flows, talent dashboards, admin tools, email systems, and billing.',
  },
  setup: {
    label: 'Workflow',
    image: '/content/about/computerrv.png',
    alt: 'RGB-lit computer setup running Evan’s Linux environment',
    headline: 'Omarchy, JetBrains, Claude Code.',
    intro: 'My tools are opinionated, keyboard-driven, and easy to make my own.',
  },
}

const ABOUT_TOOL_GROUPS = [
  ['Frontend', ['React', 'TypeScript', 'Vite', 'Tailwind']],
  ['Backend', ['PostgreSQL', 'Node.js', 'tRPC', 'Kysely']],
  ['AI systems', ['LLMs', 'AI Agents', 'Model evals']],
] as const

const ART_CATEGORIES: ArtCategory[] = [
  {
    id: 'ai-shorts',
    label: 'RECYCLE BIN',
    icon: 'recycle',
    files: [
      {
        id: 'aishort1',
        filename: 'aishort1.mp4',
        src: '/content/art/aishort2.mp4',
        type: 'video',
        description:
          'AI short made with early Sora access. I have used generative AI tools since running local Stable Diffusion models as a teenager.',
      },
    ],
  },
  {
    id: '3d',
    label: '3D',
    files: [
      {
        id: 'blender1',
        filename: 'blender1.png',
        src: '/content/art/blender1.png',
        type: 'image',
        width: 960,
        height: 720,
        alt: 'Blender artwork processed in Photoshop',
        description: 'Modeled in Blender and processed in Photoshop.',
      },
      {
        id: 'blender2',
        filename: 'blender2.png',
        src: '/content/art/blender2.png',
        type: 'image',
        width: 720,
        height: 720,
        alt: 'Companion Blender artwork processed in Photoshop',
        description: 'Modeled in Blender and processed in Photoshop.',
      },
      {
        id: 'blenderflower',
        filename: 'blenderflower.png',
        src: '/content/art/blenderflower.png',
        type: 'image',
        width: 256,
        height: 256,
        alt: 'Retro low-poly flower model',
        description: 'Retro PS1-style design made with low-poly modeling.',
      },
      {
        id: 'blenderphone',
        filename: 'blenderphone.png',
        src: '/content/art/blenderphone.png',
        type: 'image',
        width: 452,
        height: 468,
        alt: 'Retro low-poly phone model',
        description: 'Retro PS1-style design made with low-poly modeling.',
      },
    ],
  },
  {
    id: 'digital-painting',
    label: 'DIGITAL PAINTING',
    files: [
      {
        id: 'digitalpainting',
        filename: 'digitalpainting.png',
        src: '/content/art/digitalpainting.png',
        type: 'image',
        width: 679,
        height: 680,
        alt: 'Digital painting with posterized detail',
        description:
          'Photoshop painting with pixelated and posterized filtering.',
      },
      {
        id: 'digitalpainting2',
        filename: 'digitalpainting2.png',
        src: '/content/art/digitalpainting2.png',
        type: 'image',
        width: 678,
        height: 680,
        alt: 'Stylized digital painting made in Photoshop',
        description:
          'Photoshop painting with pixelated and posterized filtering.',
      },
      {
        id: 'digitalpainting3',
        filename: 'digitalpainting3.png',
        src: '/content/art/digitalpainting3.png',
        type: 'image',
        width: 400,
        height: 400,
        alt: 'Posterized digital painting',
        description:
          'Photoshop painting with pixelated and posterized filtering.',
      },
    ],
  },
  {
    id: 'photography',
    label: 'PHOTOGRAPHY',
    files: [
      {
        id: 'photography1',
        filename: 'photography1.png',
        src: '/content/art/photography1.png',
        type: 'image',
        width: 1269,
        height: 846,
        alt: 'Virginia woods shelf fungus photograph',
        description: 'Shelf fungus photographed on a Virginia woods walk.',
      },
      {
        id: 'photography2',
        filename: 'photography2.png',
        src: '/content/art/photography2.png',
        type: 'image',
        width: 1269,
        height: 846,
        alt: 'Close photograph of shelf fungus in Virginia woods',
        description: 'Shelf fungus photographed on a Virginia woods walk.',
      },
    ],
  },
  {
    id: 'self-portraits',
    label: 'SELF PORTRAITS',
    files: [
      {
        id: 'selfportrait1',
        filename: 'selfportrait1.png',
        src: '/content/art/selfportrait1.png',
        type: 'image',
        width: 960,
        height: 960,
        alt: 'Emotional multimedia self portrait',
        description:
          'Self portrait made by collaging facial features onto a Blender model, then processing the result in Photoshop.',
      },
      {
        id: 'selfportrait2',
        filename: 'selfportrait2.png',
        src: '/content/art/selfportrait2.png',
        type: 'image',
        width: 540,
        height: 540,
        alt: 'Processed multimedia self portrait',
        description:
          'Self portrait made by collaging facial features onto a Blender model, then processing the result in Photoshop.',
      },
      {
        id: 'selfportrait3',
        filename: 'selfportrait3.png',
        src: '/content/art/selfportrait3.png',
        type: 'image',
        width: 3300,
        height: 2550,
        alt: 'Self portrait stencil artwork for shirt dyeing',
        description:
          'Self portrait made as a stencil for shirt dyeing.',
      },
    ],
  },
  {
    id: 'music',
    label: 'MUSIC',
    files: [
      {
        id: 'songsample',
        filename: 'songsample.wav',
        src: '/content/art/songsample.wav',
        type: 'audio',
        description:
          'FL Studio track built around a Roland TB-303-style acid bass.',
      },
    ],
  },
]

type Project = {
  id: string
  name: string
  category: string
  meta: string
  tileLine: string
  summary: string
  quickRead?: string
  cloud: string
  glyph: string
  screenshots?: Array<{
    src: string
    alt: string
    caption?: string
  }>
  links?: Array<{
    label: string
    href: string
  }>
  diagram?: {
    kind: 'architecture' | 'decision' | 'loop'
    title: string
    lanes?: Array<{
      label: string
      items: string[]
    }>
    flow?: string[]
    branches?: Array<{
      label: string
      target: string
    }>
  }
  sections: Array<{
    title: string
    body: string
  }>
}

const PROJECTS: Project[] = [
  {
    id: 'ephemera-web',
    name: 'Ephemera Web Platform',
    category: 'Creator Platform',
    meta: 'Product / Backend',
    tileLine: 'Transaction layer for creator deals with checkout, dashboards, admin tools, email systems, and billing.',
    summary:
      'A platform where customers commission custom videos, personal messages, and signed autographs directly from talent. It runs each order end to end and gives talent a dashboard built around the AI agent and the email infrastructure it rides on.',
    quickRead:
      'Ephemera was a pre-seed creator platform built as a transaction hub between creators, brands, and fans. It combined AI-assisted brand-deal tooling with fan-facing offerings like custom videos, personal messages, and signed autographs. I was the sole developer, and the product reached talent testing and investor demos before the company shut down after failing to raise enough capital.',
    cloud: '/content/projects/clouds/cloud-tile-00.png',
    glyph: '/glyphs/projects/naah_house_inv.png',
    screenshots: [
      {
        src: '/content/projects/landingephemera.png',
        alt: 'Ephemera web platform landing page screenshot',
        caption: 'Public landing page',
      },
      {
        src: '/content/projects/signupephemera.png',
        alt: 'Ephemera signup flow screenshot',
        caption: 'Signup flow',
      },
      {
        src: '/content/projects/admindashephemera.png',
        alt: 'Ephemera admin dashboard screenshot',
        caption: 'Admin dashboard',
      },
    ],
    diagram: {
      kind: 'architecture',
      title: 'Architecture',
      lanes: [
        {
          label: 'Frontend',
          items: ['Public site', 'Customer flow', 'Talent dashboard', 'Admin tools'],
        },
        {
          label: 'API',
          items: ['tRPC routes', 'Auth boundaries', 'Validation', 'Stripe'],
        },
        {
          label: 'Data',
          items: ['Users', 'Talent', 'Orders', 'Messages'],
        },
      ],
    },
    sections: [
      {
        title: 'Overview',
        body: 'Ephemera was a pre-seed creator platform for buying custom content and handling brand work directly with talent. Customers could commission videos, personal messages, or signed autographs, while talent managed requests and inbox activity from a dashboard. The product reached talent testing and investor demos before the company shut down after failing to raise enough capital.',
      },
      {
        title: 'Built',
        body: 'As the sole developer, I owned the product surface across customer checkout, talent dashboards, admin tooling, connected inbox settings, order state, auth boundaries, and Stripe billing. The platform supported around a dozen onboarded talent accounts plus investor demo accounts, so the work had to hold up across public flows, internal operations, and live product reviews.',
      },
      {
        title: 'Stack',
        body: 'React, TypeScript, Vite, Tailwind, TanStack Query, tRPC, Supabase, PostgreSQL, Kysely, Stripe, Better Auth, Turbo',
      },
    ],
  },
  {
    id: 'ai-talent-agent',
    name: 'Ephemera AI Talent Agent',
    category: 'AI Workflow',
    meta: 'LLM / Email',
    tileLine: 'Agentic work pipeline for creator brand deals, from inbox detection to drafted replies and invoicing.',
    summary:
      'An agentic work pipeline that detects brand deals, extracts terms, checks creator rules, and moves replies through approval.',
    quickRead:
      'Ephemera AI Talent Agent was an agentic work pipeline for creator brand deals. It turned messy inbound email threads into structured deal work by identifying opportunities, extracting terms, checking creator rules, and preparing replies for review or authorized auto-send.',
    cloud: '/content/projects/clouds/cloud-tile-01.png',
    glyph: '/glyphs/projects/il_see_inv.png',
    screenshots: [
      {
        src: '/content/projects/aiinboxephemera.png',
        alt: 'AI talent agent inbox interface screenshot',
      },
    ],
    diagram: {
      kind: 'decision',
      title: 'Agent Workflow',
      flow: [
        'Inbound email',
        'Classify deal',
        'Extract terms',
        'Apply rules',
        'Draft reply',
        'Human approval',
      ],
      branches: [
        { label: 'Missing terms', target: 'Clarification' },
        { label: 'Approved', target: 'Send / invoice' },
      ],
    },
    sections: [
      {
        title: 'Overview',
        body: 'Ephemera AI Talent Agent is an agentic work pipeline for creator inboxes, built for the same pre-seed product and tested against feedback from onboarded talent accounts. Its job was to move brand opportunities through a structured sequence of detection, analysis, rule checks, drafting, and approval without giving the model unchecked control over sensitive actions.',
      },
      {
        title: 'Built',
        body: 'I built the agent pipeline across OAuth inbox connection, provider webhooks, worker processing, Claude analysis, approval routing, outbound replies, deliverable tracking, and Stripe invoicing. Workers skipped duplicate and self-sent mail, while the model handled extraction and normal code enforced creator rules, send permissions, and approval boundaries.',
      },
      {
        title: 'Workflow',
        body: 'A new email triggers a worker to fetch the thread and decide whether it is a brand inquiry. If it is, Claude pulls the proposed terms out of the message and checks them against the creator’s standing rules. The model handles classification and term extraction, while rules like minimum pay, excluded brands, and approval requirements stay in normal code instead of being left to the model. When the brand has left something missing the agent replies on the same thread to fill in the gap. Once the terms are complete the agent prepares the response. It either sends that response on its own when the talent has authorized auto-send, or queues it for the talent to review.',
      },
      {
        title: 'Stack',
        body: 'TypeScript, BullMQ, Redis, Anthropic Claude API, Gmail API, Google Pub/Sub, Microsoft Graph API, Mailgun, Stripe, PostgreSQL, Kysely',
      },
    ],
  },
  {
    id: 'evanflow',
    name: 'Evanflow',
    category: 'Open Source',
    meta: 'Agents / TDD',
    tileLine: 'Open-source Claude Code workflow with nearly 400 GitHub stars.',
    summary: 'An open-source Claude Code workflow for planning, test-first implementation, review, and iteration.',
    cloud: '/content/projects/clouds/cloud-tile-02.png',
    glyph: '/glyphs/projects/bih_road_inv.png',
    links: [{ label: 'GitHub', href: 'https://github.com/evanklem/evanflow' }],
    diagram: {
      kind: 'loop',
      title: 'Workflow Loop',
      flow: ['Brainstorm', 'Plan approval', 'RED test', 'Implement', 'Review', 'Iterate'],
      branches: [
        { label: 'Context full', target: 'Summarize' },
        { label: 'Scope drift', target: 'Re-plan' },
      ],
    },
    sections: [
      {
        title: 'Overview',
        body: 'Evanflow is a Claude Code plugin that turns loose AI coding sessions into a repeatable workflow. It walks each task from brainstorm through plan, test-first implementation, and review, with a built-in iteration loop and context-management skills for when the conversation gets long. The project has earned nearly 400 GitHub stars.',
      },
      {
        title: 'Built',
        body: 'Evanflow ships as a Claude Code plugin. The package contains 16 custom skills, 2 subagents, install docs, and a guardrail hook that blocks dangerous git operations. The workflow itself runs from a single entry point that coordinates coder and overseer agents in parallel. It enforces a failing-test checkpoint before any implementation lands and pauses for explicit human approval at key handoffs.',
      },
      {
        title: 'Workflow',
        body: 'The loop moves from design approval to plan approval to execution, then pushes code-writing tasks through test-first vertical slices. For parallel work, coder agents implement against a shared contract while read-only overseers cross-check their output for bugs, scope drift, and interface mismatches that often slip past a single agent.',
      },
      {
        title: 'Stack',
        body: 'Claude Code, Bash, Markdown',
      },
    ],
  },
  {
    id: 'omarchy-avocado-theme',
    name: 'Omarchy Avocado Theme',
    category: 'Linux Theme',
    meta: 'UI / Open Source',
    tileLine: 'Ships in the official Omarchy manual.',
    summary: 'An avocado-green desktop theme that ships in the official Omarchy manual as an included extra theme.',
    cloud: '/content/projects/clouds/cloud-tile-03.png',
    glyph: '/glyphs/projects/ahn_leaf_inv.png',
    screenshots: [
      {
        src: '/content/projects/omarchytheme.png',
        alt: 'Omarchy Avocado Theme desktop screenshot',
      },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/evanklem/omarchy-avocado-theme' },
    ],
    sections: [
      {
        title: 'Overview',
        body: 'Omarchy Avocado Theme is a desktop visual theme that ships in the official Omarchy manual as one of its included extra themes. It uses a dark avocado-green palette with warm yellow contrast and readable UI states across every part of the desktop.',
      },
      {
        title: 'Built',
        body: 'I designed the avocado-green palette and ported it across every layer of the Omarchy desktop, configuring Hyprland, Alacritty, and Neovim alongside the launcher, status bar, lock screen, and notification system. Matching icons and original wallpapers tie the look together.',
      },
      {
        title: 'Stack',
        body: 'Omarchy, Hyprland, Alacritty, Neovim/LazyVim, Waybar, btop, Mako, Walker, Hyprlock',
      },
    ],
  },
  {
    id: 'ai-fraud-detection',
    name: 'AI Fraud Detection System',
    category: 'Machine Learning',
    meta: 'Python / ML',
    tileLine: 'Imbalanced fraud classifier.',
    summary:
      'A credit card fraud classifier built around rare-event detection on heavily imbalanced transaction data.',
    cloud: '/content/projects/clouds/cloud-tile-04.png',
    glyph: '/glyphs/projects/tok_flint_inv.png',
    links: [{ label: 'GitHub', href: 'https://github.com/evanklem/frauddetector' }],
    sections: [
      {
        title: 'Overview',
        body: 'AI Fraud Detection System is a Python machine learning pipeline for classifying credit card fraud from 284,807 transactions where fraudulent samples make up less than 1 percent of the dataset. In project evaluation, the tuned model reached up to a 0.88 F1 score, a metric that balances catching fraud with avoiding false alarms.',
      },
      {
        title: 'Built',
        body: 'I built the pipeline from raw data to a saved model. After basic cleanup like removing duplicate transactions and rescaling outlier-heavy columns, the bigger problem was the data itself: real fraud is under one percent of transactions, so a model could score 99 percent accuracy just by guessing "not fraud" every time. To get around that I used SMOTE, which synthesizes extra fraud examples to balance the training set. From there I trained and tuned two classifiers, a Random Forest and an XGBoost model, and the winning version gets saved alongside its evaluation report.',
      },
      {
        title: 'Evaluation',
        body: 'With fraud under one percent of the data, a model can look accurate while still missing the thing it is supposed to catch. I evaluated each model on what actually catches the rare class: precision and recall on fraud cases, F1, the confusion matrix, and AUPRC. Splits are stratified so the train and test sets carry the same fraud ratio as the original data, and 5-fold cross-validation runs on top so the score averages across several slices of the data instead of one lucky split.',
      },
      {
        title: 'Stack',
        body: 'Python, pandas, scikit-learn, XGBoost, imbalanced-learn, SMOTE, Matplotlib',
      },
    ],
  },
  {
    id: 'personal-site',
    name: 'evanklem.com',
    category: 'Portfolio System',
    meta: 'React / Three.js',
    tileLine: 'Interactive portfolio with persistent WebGL, responsive panels, and custom media systems.',
    summary:
      'A hand-built portfolio that treats the site itself as the product: a live 3D scene, section-specific interfaces, museum-scanned artifacts, and a custom archive for project and art content.',
    cloud: '/content/projects/clouds/cloud-tile-05.png',
    glyph: '/glyphs/projects/tzihb_write_inv.png',
    sections: [
      {
        title: 'Overview',
        body: 'evanklem.com is a custom React and Three.js portfolio built around a live WebGL scene instead of a static page. The visual system uses museum-scanned Maya artifacts, real glyph references, and interface patterns from early console and desktop software without turning the content into a gimmick.',
      },
      {
        title: 'Built',
        body: 'I built the scene architecture, navigation, responsive panel system, project browser, art archive, mobile states, and asset pipeline. The 3D layer stays mounted while sections open and close, which keeps the animation, background, and section transitions feeling like one continuous product.',
      },
      {
        title: 'Stack',
        body: 'React, TypeScript, Vite, Three.js, React Three Fiber, Drei, CSS',
      },
    ],
  },
]

export function SectionPanel() {
  const { activeRegion, setActiveRegion } = useNavState()
  const open = activeRegion !== null
  const [lastRegionId, setLastRegionId] = useState<string | null>(activeRegion)
  const visibleRegionId = activeRegion ?? lastRegionId
  const region = visibleRegionId ? REGIONS.find((r) => r.id === visibleRegionId) : null
  const accent = region?.accentColor ?? '#c4ff00'
  const isAbout = region?.id === 'about'
  const isProjects = region?.id === 'projects'
  const isArt = region?.id === 'art'
  const usesPanelBack = isAbout || isProjects || isArt

  useEffect(() => {
    if (activeRegion) {
      // Keep the closing panel content mounted during its slide-out animation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastRegionId(activeRegion)
    }
  }, [activeRegion])

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
          <p className="panel__body">{LOREM}</p>
        )}
      </div>
    </div>
  )
}

function ProjectsPanelBody({
  closeButton,
  panelOpen,
}: {
  closeButton: ReactNode
  panelOpen: boolean
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [expandedMediaSrc, setExpandedMediaSrc] = useState<string | null>(null)
  const [gridReady, setGridReady] = useState(false)
  const [visibleProjectCount, setVisibleProjectCount] = useState(0)
  const selectedProject = PROJECTS.find((project) => project.id === selectedProjectId)

  useEffect(() => {
    if (!panelOpen || selectedProjectId) {
      setGridReady(false)
      setVisibleProjectCount(0)
      return
    }

    const delay = prefersSingleTapOpen() ? 360 : 80
    const id = window.setTimeout(() => {
      setGridReady(true)
    }, delay)
    return () => window.clearTimeout(id)
  }, [panelOpen, selectedProjectId])

  useEffect(() => {
    if (!gridReady) {
      setVisibleProjectCount(0)
      return
    }

    let nextCount = 0
    const id = window.setInterval(() => {
      nextCount += 1
      setVisibleProjectCount(nextCount)
      if (nextCount >= PROJECTS.length) window.clearInterval(id)
    }, 55)
    return () => window.clearInterval(id)
  }, [gridReady])

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
      <div key={`project-detail-${selectedProject.id}`} className="projects-body projects-body--detail">
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
      {gridReady && (
        <div className="projects-grid">
          {PROJECTS.slice(0, visibleProjectCount).map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              onSelect={() => setSelectedProjectId(project.id)}
            />
          ))}
        </div>
      )}
    </section>
  </div>
  )
}

function ArtPanelBody({ closeButton }: { closeButton: ReactNode }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [openFileId, setOpenFileId] = useState<string | null>(null)
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null)
  const openCategory = ART_CATEGORIES.find((category) => category.id === openCategoryId) ?? null
  const selectedFile = openCategory?.files.find((file) => file.id === selectedFileId) ?? null
  const openFile = openCategory?.files.find((file) => file.id === openFileId) ?? null
  const expandedFile = ART_CATEGORIES.flatMap((category) => category.files).find(
    (file) => file.id === expandedFileId,
  )
  const taskbarLabel = openFile?.filename ?? openCategory?.label ?? 'Art Archive'

  const openCategoryWindow = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setOpenCategoryId(categoryId)
    setSelectedFileId(null)
    setOpenFileId(null)
    setExpandedFileId(null)
  }

  const closeCategoryWindow = () => {
    setOpenCategoryId(null)
    setSelectedCategoryId(null)
    setSelectedFileId(null)
    setOpenFileId(null)
    setExpandedFileId(null)
  }

  const handleFolderKeyDown = (event: KeyboardEvent<HTMLButtonElement>, categoryId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      openCategoryWindow(categoryId)
    }
  }

  return (
    <div className="art-body">
      {closeButton}
      <header className="art-readout" aria-label="Art section status">
        <span>Personal art archive</span>
      </header>

      <section className="art-desktop" aria-label="Mini desktop art archive">
        <div className="art-desktop__icons" role="list" aria-label="Art folders">
          {ART_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className="art-folder"
              data-icon={category.icon ?? 'folder'}
              aria-pressed={selectedCategoryId === category.id}
              onClick={() => {
                if (prefersSingleTapOpen()) {
                  openCategoryWindow(category.id)
                  return
                }
                setSelectedCategoryId(category.id)
              }}
              onDoubleClick={() => openCategoryWindow(category.id)}
              onKeyDown={(event) => handleFolderKeyDown(event, category.id)}
              data-interactive
            >
              <span className="art-folder__icon" aria-hidden="true" />
              <span className="art-folder__label">{category.label}</span>
            </button>
          ))}
        </div>

        {openCategory && (
          <>
            <ArtFolderWindow
              category={openCategory}
              selectedFile={selectedFile}
              onClose={closeCategoryWindow}
              onSelectFile={setSelectedFileId}
              onOpenFile={(fileId) => setOpenFileId(fileId)}
            />
            {openFile && (
              <ArtViewerWindow
                file={openFile}
                onClose={() => {
                  setOpenFileId(null)
                  setExpandedFileId(null)
                }}
                onExpandFile={(fileId) => setExpandedFileId(fileId)}
              />
            )}
          </>
        )}

        <div className="art-taskbar" aria-label="Art archive taskbar">
          <span className="art-taskbar__start">start</span>
          <span className="art-taskbar__status">{taskbarLabel}</span>
        </div>
      </section>

      {expandedFile &&
        createPortal(
          <div className="art-media-expanded" aria-label={`Expanded ${expandedFile.filename}`}>
            <div
              className="art-media-expanded__window"
              role="dialog"
              aria-labelledby="art-media-expanded-title"
              data-kind={expandedFile.type}
            >
              <div className="art-media-expanded__bar">
                <h3 id="art-media-expanded-title">{expandedFile.filename}</h3>
                <div className="art-media-expanded__controls">
                  <button
                    type="button"
                    className="art-window__xp-control art-window__xp-control--maximize"
                    aria-label="Restore down"
                    onClick={() => setExpandedFileId(null)}
                    data-interactive
                  >
                    <span className="art-window__xp-glyph art-window__xp-glyph--restore" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="art-window__xp-control art-window__xp-control--close"
                    aria-label="Close"
                    onClick={() => setExpandedFileId(null)}
                    data-interactive
                  >
                    <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="art-media-expanded__surface">
                {expandedFile.type === 'image' && (
                  <img src={expandedFile.src} alt={expandedFile.alt ?? expandedFile.filename} />
                )}
                {expandedFile.type === 'video' && (
                  <video
                    src={expandedFile.src}
                    controls
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    playsInline
                    aria-label={expandedFile.filename}
                  />
                )}
                {expandedFile.type === 'audio' && <ArtAudioPlayer file={expandedFile} />}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function ArtFolderWindow({
  category,
  selectedFile,
  onClose,
  onSelectFile,
  onOpenFile,
}: {
  category: ArtCategory
  selectedFile: ArtFile | null
  onClose: () => void
  onSelectFile: (fileId: string) => void
  onOpenFile: (fileId: string) => void
}) {
  const handleFileKeyDown = (event: KeyboardEvent<HTMLButtonElement>, fileId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onOpenFile(fileId)
    }
  }

  return (
    <div className="art-window art-window--folder" role="dialog" aria-labelledby="art-folder-window-title">
      <div className="art-window__titlebar">
        <div className="art-window__controls">
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--close"
            aria-label="Close folder"
            onClick={onClose}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
          </button>
        </div>
        <h3 id="art-folder-window-title">{category.label}</h3>
      </div>

      <div className="art-window__files" role="listbox" aria-label={`${category.label} files`}>
        {category.files.map((file) => (
          <button
            key={file.id}
            type="button"
            className="art-file"
            role="option"
            aria-selected={selectedFile?.id === file.id}
            onClick={() => {
              if (prefersSingleTapOpen()) {
                onOpenFile(file.id)
                return
              }
              onSelectFile(file.id)
            }}
            onDoubleClick={() => onOpenFile(file.id)}
            onKeyDown={(event) => handleFileKeyDown(event, file.id)}
            data-kind={file.type}
            data-interactive
          >
            <ArtFileIcon file={file} />
            <span className="art-file__name">{file.filename}</span>
          </button>
        ))}
      </div>
      <ArtNotes file={selectedFile} categoryLabel={category.label} />
    </div>
  )
}

function ArtViewerWindow({
  file,
  onClose,
  onExpandFile,
}: {
  file: ArtFile
  onClose: () => void
  onExpandFile: (fileId: string) => void
}) {
  const mediaRatio = file.width && file.height ? file.width / file.height : undefined

  return (
    <div
      className="art-window art-window--viewer"
      role="dialog"
      aria-labelledby="art-viewer-window-title"
      data-kind={file.type}
      style={mediaRatio ? { ['--media-ratio' as string]: mediaRatio } : undefined}
    >
      <div className="art-window__titlebar">
        <div className="art-window__controls">
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--maximize"
            aria-label={`Maximize ${file.filename}`}
            onClick={() => onExpandFile(file.id)}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--maximize" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="art-window__xp-control art-window__xp-control--close"
            aria-label="Close file"
            onClick={onClose}
            data-interactive
          >
            <span className="art-window__xp-glyph art-window__xp-glyph--close" aria-hidden="true" />
          </button>
        </div>
        <h3 id="art-viewer-window-title">{file.filename}</h3>
      </div>
      <ArtFileViewer file={file} />
    </div>
  )
}

function ArtFileIcon({ file }: { file: ArtFile }) {
  if (file.type === 'image') {
    return (
      <span className="art-file__thumb" aria-hidden="true">
        <img src={file.src} alt="" loading="lazy" />
      </span>
    )
  }

  return (
    <span className="art-file__generic" aria-hidden="true">
      <span>{file.type === 'video' ? 'MP4' : 'WAV'}</span>
    </span>
  )
}

function ArtNotes({ file, categoryLabel }: { file: ArtFile | null; categoryLabel: string }) {
  return (
    <aside className="art-notes" aria-live="polite">
      <span className="art-notes__label">Notes</span>
      <p>{file ? file.description : `Select a file in ${categoryLabel}.`}</p>
    </aside>
  )
}

function ArtFileViewer({
  file,
}: {
  file: ArtFile
}) {
  return (
    <div className="art-viewer">
      <div className="art-viewer__stage" data-kind={file.type}>
        {file.type === 'image' && (
          <img src={file.src} alt={file.alt ?? file.filename} />
        )}
        {file.type === 'video' && (
          <video
            src={file.src}
            controls
            autoPlay
            muted
            loop
            preload="metadata"
            playsInline
            aria-label={file.filename}
          />
        )}
        {file.type === 'audio' && <ArtAudioPlayer file={file} />}
      </div>
    </div>
  )
}

function ArtAudioPlayer({ file }: { file: ArtFile }) {
  return (
    <div className="art-audio">
      <div className="art-audio__display">
        <div className="art-audio__art" aria-hidden="true">
          <span className="art-audio__note">♪</span>
        </div>
        <div className="art-audio__info">
          <span className="art-audio__label">Now Playing</span>
          <span className="art-audio__filename">{file.filename}</span>
          <div className="art-audio__bars" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} style={{ ['--bar-i' as string]: i }} />
            ))}
          </div>
        </div>
      </div>
      <audio src={file.src} controls preload="metadata" aria-label={file.filename} />
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

      {project.screenshots && project.screenshots.length > 0 && (
        <div className="project-media" aria-label={`${project.name} screenshots`}>
          {project.screenshots.map((screenshot) => (
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

function AboutPanelBody({ closeButton }: { closeButton: ReactNode }) {
  const [activeMode, setActiveMode] = useState<AboutMode>('profile')
  const mode = ABOUT_MODES[activeMode]

  return (
    <div className="about-body">
      {closeButton}
      <div className="about-content">
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
            founder direction and talent feedback into working software used by onboarded talent,
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
