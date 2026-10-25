import { useCountUp } from '../hooks/useCountUp'

/**
 * Renders a rupee amount that ticks up on mount/change, like a taxi meter
 * settling on the final fare. Purely presentational — the number itself
 * always comes from real backend data.
 */
export default function MeterDigits({ value, className = '', delay = 0, duration = 900 }) {
  const animated = useCountUp(value, { delay, duration })
  return (
    <span className={`font-meter tabular-nums ${className}`}>
      ₹{Math.round(animated).toLocaleString('en-IN')}
    </span>
  )
}
