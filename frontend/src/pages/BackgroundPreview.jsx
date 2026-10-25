import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import { paint } from '../background/scene'

/**
 * /background          -> full-screen preview of the animated background
 * /background?export=1 -> fixed 1920x1080 canvas with window.__renderAt(t),
 *                         used by the MP4 export script (see docs/BACKGROUND_VIDEO.md)
 */
export default function BackgroundPreview() {
  const exportMode = new URLSearchParams(window.location.search).has('export')
  const ref = useRef(null)

  useEffect(() => {
    if (!exportMode) return undefined
    const canvas = ref.current
    canvas.width = 1920
    canvas.height = 1080
    window.__renderAt = (t) => paint(canvas, t)
    paint(canvas, 0)
    return () => {
      delete window.__renderAt
    }
  }, [exportMode])

  if (exportMode) {
    return <canvas ref={ref} style={{ width: 1920, height: 1080, display: 'block' }} />
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050807' }}>
      <AnimatedBackground forceMotion />
      <Link
        to="/"
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 5 }}
        className="rounded-full border border-ink-line bg-ink/70 px-4 py-2 text-xs font-semibold text-paper backdrop-blur hover:bg-ink-elevated"
      >
        ← Back to FairTrip
      </Link>
    </div>
  )
}
