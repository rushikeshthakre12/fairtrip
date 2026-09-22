import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number counting up from 0 to `target`, easing out — like a
 * taxi meter ticking to its final fare. Respects prefers-reduced-motion.
 */
export function useCountUp(target, { duration = 900, delay = 0 } = {}) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || target == null || Number.isNaN(target)) {
      setValue(target || 0)
      return
    }

    let start = null
    const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

    function tick(timestamp) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(1, elapsed / duration)
      setValue(target * easeOutQuint(progress))
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }

    const timeoutId = setTimeout(() => {
      frame.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration, delay])

  return value
}
