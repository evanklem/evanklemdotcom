import { useState } from 'react'
import { Scene } from './scene/Scene'
import { NavProvider } from './scene/NavProvider'
import { SectionPanel } from './scene/SectionPanel'
import { VideoBackground } from './scene/VideoBackground'
import { VerticalMenu } from './scene/VerticalMenu'
import { BootSequence } from './scene/BootSequence'
import { Cursor } from './scene/Cursor'

function App() {
  const [booted, setBooted] = useState(false)
  const [vaseReady, setVaseReady] = useState(false)

  return (
    <NavProvider>
      <VideoBackground />
      <Scene onVaseReady={() => setVaseReady(true)} />
      <VerticalMenu />
      <SectionPanel />
      <div className="grain" aria-hidden="true" />
      <Cursor />
      {!booted && <BootSequence ready={vaseReady} onComplete={() => setBooted(true)} />}
    </NavProvider>
  )
}

export default App
