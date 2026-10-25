import { useEffect, useRef, useState } from 'react'
import { LOOP, STILL_T, paint } from '../background/scene'
import { readMotionPref } from '../background/motion'

/**
 * Fixed full-screen canvas behind the whole app. Plays the 20-second seamless
 * "night ride" loop. Pauses to a still frame when the user toggles motion off
 * or prefers reduced motion; rAF stops automatically in background tabs.
 */
export default function AnimatedBackground({ forceMotion = false }) {
  const canvasRef = useRef(null)
  const [enabled, setEnabled] = useState(() => (forceMotion ? true : readMotionPref()))

  useEffect(() => {
    if (forceMotion) return undefined
    const sync = () => setEnabled(readMotionPref())
    window.addEventListener('ft-motion-change', sync)
    return () => window.removeEventListener('ft-motion-change', sync)
  }, [forceMotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animate = enabled && !reduce

    // quality: 1 = full resolution (Full HD+). Drops automatically on slow machines.
    let quality = 1
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const scale = Math.min(dpr, 2560 / Math.max(window.innerWidth, 1)) * quality
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale))
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale))
    }

    let raf = 0
    const start = performance.now()
    const still = STILL_T
    let last = start
    let slow = 0

    function frame(now) {
      const dt = now - last
      last = now
      // adaptive resolution: if frames keep taking > 34ms, step the canvas down
      slow = dt > 34 ? slow + 1 : Math.max(0, slow - 1)
      if (slow > 40 && quality > 0.5) {
        quality = Math.max(0.5, quality - 0.25)
        slow = 0
        size()
      }
      paint(canvas, ((now - start) / 1000) % LOOP)
      raf = requestAnimationFrame(frame)
    }

    function onResize() {
      size()
      if (!animate) paint(canvas, still)
    }

    size()
    window.addEventListener('resize', onResize)
    if (animate) {
      raf = requestAnimationFrame(frame)
    } else {
      paint(canvas, still)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
