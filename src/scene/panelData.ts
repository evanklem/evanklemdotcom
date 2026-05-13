export const TITLES: Record<string, string> = {
  about: 'About',
  projects: 'Projects',
  art: 'Art',
}

export const GLYPHS: Record<string, string> = {
  about: 'water',
  projects: 'fire',
  art: 'carving',
}

export type AboutMode = 'profile' | 'work' | 'setup'

export type ArtFile = {
  id: string
  filename: string
  src: string
  type: 'image' | 'video' | 'audio'
  description: string
  alt?: string
  width?: number
  height?: number
}

export function prefersSingleTapOpen() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches
  )
}

export type ArtCategory = {
  id: string
  label: string
  icon?: 'folder' | 'recycle'
  files: ArtFile[]
}

export const ABOUT_MODES: Record<
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

export const ABOUT_TOOL_GROUPS = [
  ['Frontend', ['React', 'TypeScript', 'Vite', 'Tailwind']],
  ['Backend', ['PostgreSQL', 'Node.js', 'tRPC', 'Kysely']],
  ['AI systems', ['LLMs', 'AI Agents', 'Model evals']],
] as const

export const ART_CATEGORIES: ArtCategory[] = [
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

export type Project = {
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

export const PROJECTS: Project[] = [
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
