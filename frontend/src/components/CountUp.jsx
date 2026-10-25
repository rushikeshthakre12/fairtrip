import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

/** Number that counts up the first time it scrolls into view. */
export default function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration = 1300 }) {
  const [ref, inView] = useInView()
  const v = useCountUp(inView ? value : 0, { duration })
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  )
}
