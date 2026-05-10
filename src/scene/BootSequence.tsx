import { useEffect, useState } from 'react'
import './BootSequence.css'

interface Props {
  onComplete: () => void
}

const TOTAL_MS = 1900

export function BootSequence({ onComplete }: Props) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => {
      setDone(true)
      onComplete()
    }, TOTAL_MS)
    return () => clearTimeout(t)
  }, [done, onComplete])

  const skip = () => {
    if (done) return
    setDone(true)
    onComplete()
  }

  return (
    <div
      className={`boot ${done ? 'boot--done' : ''}`}
      role="presentation"
      onClick={skip}
      onKeyDown={skip}
    >
      <div className="boot__fractal" aria-hidden="true" />
      <div className="boot__tunnel" aria-hidden="true" />
      <div className="boot__portal" aria-hidden="true" />
      <p className="boot__brand">evanklem.com</p>
    </div>
  )
}
