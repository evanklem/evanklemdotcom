import { useEffect, useRef } from 'react'
import { useNavState } from './navContext'
import { REGIONS } from './regions'
import './VideoBackground.css'

const VIDEO_SRC = '/liminalbg-dither.mp4'
const POSTER_SRC = '/liminalbg-poster.jpg'
const VIDEO_PROGRESS_EPS = 0.03
const VIDEO_STALL_MS = 7000

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

    v.defaultMuted = true
    v.muted = true
    v.playsInline = true
    v.controls = false
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.setAttribute('x-webkit-airplay', 'deny')

    let lastTime = 0
    let lastProgressAt = performance.now()

    const tryPlay = () => {
      if (document.hidden) return
      if (!v.paused && !v.ended) return
      void Promise.resolve(v.play()).catch(() => {})
    }
    const noteProgress = () => {
      if (Math.abs(v.currentTime - lastTime) > VIDEO_PROGRESS_EPS) {
        lastTime = v.currentTime
        lastProgressAt = performance.now()
      }
    }
    const recoverPlayback = () => {
      if (document.hidden) return
      noteProgress()

      const stalledFor = performance.now() - lastProgressAt
      if (stalledFor < VIDEO_STALL_MS) {
        tryPlay()
        return
      }

      lastProgressAt = performance.now()
      if (v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        v.load()
      } else {
        v.currentTime = Math.min(v.duration || Number.POSITIVE_INFINITY, v.currentTime + 0.04)
      }
      tryPlay()
    }
    tryPlay()
    const progressCheckId = window.setInterval(recoverPlayback, 3500)
    window.addEventListener('touchend', tryPlay, { passive: true })
    window.addEventListener('click', tryPlay)
    window.addEventListener('keydown', tryPlay)
    window.addEventListener('pageshow', recoverPlayback)
    document.addEventListener('visibilitychange', recoverPlayback)
    v.addEventListener('loadedmetadata', tryPlay)
    v.addEventListener('canplay', tryPlay)
    v.addEventListener('timeupdate', noteProgress)
    v.addEventListener('playing', noteProgress)
    v.addEventListener('stalled', recoverPlayback)
    v.addEventListener('waiting', recoverPlayback)
    v.addEventListener('suspend', recoverPlayback)
    return () => {
      window.clearInterval(progressCheckId)
      window.removeEventListener('touchend', tryPlay)
      window.removeEventListener('click', tryPlay)
      window.removeEventListener('keydown', tryPlay)
      window.removeEventListener('pageshow', recoverPlayback)
      document.removeEventListener('visibilitychange', recoverPlayback)
      v.removeEventListener('loadedmetadata', tryPlay)
      v.removeEventListener('canplay', tryPlay)
      v.removeEventListener('timeupdate', noteProgress)
      v.removeEventListener('playing', noteProgress)
      v.removeEventListener('stalled', recoverPlayback)
      v.removeEventListener('waiting', recoverPlayback)
      v.removeEventListener('suspend', recoverPlayback)
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
      <div className="bg-video-poster" aria-hidden="true" />
      <video
        ref={videoRef}
        className="bg-video"
        poster={POSTER_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onPlaying={(event) => {
          event.currentTarget.dataset.playing = 'true'
        }}
        onPause={(event) => {
          delete event.currentTarget.dataset.playing
        }}
        aria-hidden="true"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div className="bg-dither" aria-hidden="true" />
      <div ref={tintRef} className="bg-tint" aria-hidden="true" />
    </>
  )
}
