import { useEffect, useState } from 'react'
import { Sparkles, Languages, Copy, Check, Loader2 } from 'lucide-react'
import { explainResult } from '../services/api'

/**
 * AI Trip Assistant: explains the ML result in English or Marathi and gives a
 * negotiation line for the driver. The AI writes the words only. The range and
 * status shown on the page still come from the Random Forest.
 */
export default function AiExplainCard({ result }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [lang, setLang] = useState('en')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    explainResult({
      city: result.city,
      service_type: result.service_type,
      distance_km: result.distance_km,
      quoted_price: result.quoted_price,
      predicted_price: result.predicted_price,
      range_min: result.estimated_range.min,
      range_max: result.estimated_range.max,
      status: result.status,
      top_factors: (result.explanation || []).slice(0, 2).map((f) => f.factor),
    })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [result])

  const text = data ? (lang === 'mr' ? data.marathi : data.english) : ''
  const negotiation = data ? (lang === 'mr' ? data.negotiation.marathi : data.negotiation.english) : ''

  async function copyLine() {
    try {
      await navigator.clipboard.writeText(negotiation)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked: ignore */
    }
  }

  return (
    <div className="mt-6 rounded-card border border-signal/25 bg-ink-soft p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-signal" />
          <h2 className="font-display text-lg font-bold text-paper">AI Trip Assistant</h2>
        </div>
        <div className="flex rounded-full border border-ink-line p-0.5 text-xs font-semibold">
          {[['en', 'English'], ['mr', 'मराठी']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setLang(key)}
              className={`rounded-full px-3 py-1 transition-colors ${
                lang === key ? 'bg-signal text-ink' : 'text-slate hover:text-paper'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-coral">Assistant unavailable right now: {error}</p>}
      {!data && !error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate">
          <Loader2 size={14} className="animate-spin" /> Writing explanation…
        </p>
      )}

      {data && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-paper/90">{text}</p>

          <div className="mt-5 rounded-xl bg-ink-elevated p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate">
              <Languages size={13} /> Say this to the driver
            </p>
            <p className="mt-2 font-display text-lg font-bold text-signal">{negotiation}</p>
            <p className="mt-1 text-xs text-slate">Hinglish: {data.negotiation.hinglish}</p>
            <button
              type="button"
              onClick={copyLine}
              className="mt-3 flex items-center gap-1.5 rounded-full border border-ink-line px-3 py-1.5 text-xs font-semibold text-paper hover:bg-ink"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy line'}
            </button>
          </div>

          
        </>
      )}
    </div>
  )
}
