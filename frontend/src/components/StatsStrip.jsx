import { useEffect, useState } from 'react'
import { getCities, getModelInfo, getServices } from '../services/api'
import CountUp from './CountUp'
import Reveal from './Reveal'
import { PLACE_COUNT } from '../data/landmarks'

/**
 * Live numbers pulled from the API (real model metrics, real supported
 * cities/services). If the API is unreachable the strip simply doesn't render —
 * it never shows made-up figures.
 */
export default function StatsStrip() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([getModelInfo(), getCities(), getServices()])
      .then(([m, c, s]) => {
        if (alive) setData({ r2: m.r2, mae: m.mae, cities: c.length, services: s.length })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!data) return null

  const tiles = [
    { label: 'Cities supported', node: <CountUp value={data.cities} /> },
    { label: 'Places mapped', node: <CountUp value={PLACE_COUNT} /> },
    { label: 'Model R² (held-out)', node: <CountUp value={data.r2} decimals={2} /> },
    { label: 'Avg. error (MAE)', node: <CountUp value={data.mae} prefix="₹" /> },
  ]

  return (
    <section className="mx-auto max-w-6xl px-5 pb-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 110}>
            <div className="rounded-card border border-ink-line bg-ink-soft p-5 text-center shadow-card transition-transform hover:-translate-y-1">
              <p className="font-meter text-3xl font-extrabold text-signal">{t.node}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate">{t.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-light">
        Live from the API · metrics measured on a held-out test split of the demo/prototype dataset
      </p>
    </section>
  )
}
