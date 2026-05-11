import { lazy, Suspense, useState } from 'react'
import { Scene } from './scene/Scene'
import { NavProvider } from './scene/NavProvider'
import { VideoBackground } from './scene/VideoBackground'
import { VerticalMenu } from './scene/VerticalMenu'
import { BootSequence } from './scene/BootSequence'
import { Cursor } from './scene/Cursor'

const SectionPanel = lazy(() =>
  import('./scene/SectionPanel').then((module) => ({ default: module.SectionPanel })),
)

function App() {
  const [booted, setBooted] = useState(false)
  const [vaseReady, setVaseReady] = useState(false)

  return (
    <NavProvider>
      <VideoBackground />
      <Scene onVaseReady={() => setVaseReady(true)} />
      <VerticalMenu />
      <Suspense fallback={null}>
        <SectionPanel />
      </Suspense>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      {!booted && <BootSequence ready={vaseReady} onComplete={() => setBooted(true)} />}
    </NavProvider>
  )
}

export default App
