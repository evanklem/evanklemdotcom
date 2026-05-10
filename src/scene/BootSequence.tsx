import { useEffect, useState } from 'react'
import './BootSequence.css'

interface Props {
  ready: boolean
  onComplete: () => void
}

const MIN_MS = 1700

export function BootSequence({ ready, onComplete }: Props) {
  const [done, setDone] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (done || !ready || !minElapsed) return
    let completeTimer: number | undefined
    const fadeTimer = setTimeout(() => {
      setDone(true)
      completeTimer = window.setTimeout(onComplete, 460)
    }, 260)
    return () => {
      clearTimeout(fadeTimer)
      if (completeTimer) clearTimeout(completeTimer)
    }
  }, [done, minElapsed, onComplete, ready])

  const skip = () => {
    if (done || !ready) return
    setDone(true)
    setTimeout(onComplete, 460)
  }

  return (
    <div
      className={`boot ${done ? 'boot--done' : ''}`}
      role="presentation"
      onClick={skip}
      onKeyDown={skip}
    >
      <div className="boot__fractal" aria-hidden="true" />
    </div>
  )
}
