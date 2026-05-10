import { useEffect, useRef } from 'react'
import { useNavState } from './navContext'
import { REGIONS } from './regions'
import './VideoBackground.css'

const VIDEO_SRC = '/liminalbg-dither.mp4'

/**
 * DOM-based video background. Sits behind the transparent WebGL canvas in a
 * fixed full-screen layer. The dither is baked into the MP4 asset, so runtime
 * work stays close to a normal video decode.
 *
 * Per-section hue tint applied via a sibling overlay div with mix-blend-mode
 * `multiply`, color animated via CSS variable.
 */
export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const tintRef = useRef<HTMLDivElement>(null)
  const { activeRegion } = useNavState()

  // Resume play on first interaction in case autoplay was blocked.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tryPlay = () => {
      void v.play()?.catch(() => {})
    }
    tryPlay()
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('keydown', tryPlay)
    return () => {
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }
  }, [])

  useEffect(() => {
    if (!tintRef.current) return
    const accent = activeRegion
      ? REGIONS.find((r) => r.id === activeRegion)?.accentColor ?? 'transparent'
      : 'transparent'
    tintRef.current.style.setProperty('--bg-tint', accent)
    tintRef.current.style.setProperty('--bg-tint-amount', activeRegion ? '0.55' : '0')
  }, [activeRegion])

  return (
    <>
      <video
        ref={videoRef}
        className="bg-video"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
      />
      <div className="bg-dither" aria-hidden="true" />
      <div ref={tintRef} className="bg-tint" aria-hidden="true" />
    </>
  )
}
