import { useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { predictPrice } from '../services/api'
import StatusBadge from './StatusBadge'
import MeterDigits from './MeterDigits'

const TIME_PRESETS = [
  { label: 'Morning', time: '09:00' },
  { label: 'Evening', time: '20:30' },
  { label: 'Late Night', time: '23:30' },
]

/**
 * A live, working teaser embedded in the hero — not a mockup. Moving the
 * slider debounces a real call to /api/predict against a fixed demo
 * scenario (Mumbai, Taxi) so a visitor sees the actual model respond
 * before they ever reach the full Checker form.
 */
export default function LiveDemoWidget() {
  const [distance, setDistance] = useState(15)
  const [timePreset, setTimePreset] = useState(TIME_PRESETS[1])
  const [quote, setQuote] = useState(900)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await predictPrice({
          city: 'Mumbai',
          service_type: 'Taxi',
          distance_km: distance,
          date: new Date().toISOString().slice(0, 10),
          time: `${timePreset.time}:00`,
          quoted_price: quote,
          vehicle_type: 'Sedan',
        })
        setResult(data)
      } catch (err) {
        setError('Live demo is temporarily unavailable.')
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(debounceRef.current)
  }, [distance, timePreset, quote])

  return (
    <div className="relative rounded-card border border-paper/10 bg-ink-soft p-6 shadow-card">
      <div className="flex items-center gap-1.5 text-signal">
        <Sparkles size={14} />
        <span className="font-meter text-[11px] font-semibold uppercase tracking-[0.2em]">Live Demo — real model, real time</span>
      </div>
      <p className="mt-2 text-xs text-paper/50">Mumbai · Taxi — drag the sliders and watch the model respond</p>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-paper/70">
            <span>Distance</span>
            <span className="font-meter font-semibold text-paper">{distance} km</span>
          </div>
          <input
            type="range" min="1" max="40" value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="mt-1.5 w-full accent-signal"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-paper/70">
            <span>Quoted Price</span>
            <span className="font-meter font-semibold text-paper">₹{quote}</span>
          </div>
          <input
            type="range" min="50" max="1500" step="10" value={quote}
            onChange={(e) => setQuote(Number(e.target.value))}
            className="mt-1.5 w-full accent-signal"
          />
        </div>

        <div className="flex gap-2">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setTimePreset(preset)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                timePreset.label === preset.label ? 'bg-signal text-ink' : 'bg-paper/10 text-paper/70 hover:bg-paper/15'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-paper/5 px-4 py-3">
        {loading ? (
          <span className="flex items-center gap-2 text-xs text-paper/50">
            <Loader2 size={14} className="animate-spin" /> Model is thinking...
          </span>
        ) : error ? (
          <span className="text-xs text-coral">{error}</span>
        ) : result ? (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-paper/40">Typical range</p>
              <p className="font-meter text-sm font-semibold text-teal">
                <MeterDigits value={result.estimated_range.min} className="text-teal" duration={400} />
                {' – '}
                <MeterDigits value={result.estimated_range.max} className="text-teal" duration={400} />
              </p>
            </div>
            <StatusBadge status={result.status} />
          </>
        ) : (
          <span className="text-xs text-paper/40">—</span>
        )}
      </div>
    </div>
  )
}
