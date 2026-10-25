import { useInView } from '../hooks/useInView'

/** Fades + slides its children up when they scroll into view. */
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, inView] = useInView()
  return (
    <Tag ref={ref} style={{ '--d': `${delay}ms` }} className={`reveal ${inView ? 'in-view' : ''} ${className}`}>
      {children}
    </Tag>
  )
}
