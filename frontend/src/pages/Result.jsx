import { useLocation, useNavigate, Link } from 'react-router-dom'
import { AlertTriangle, Info, MapPin, Clock, Car, ArrowLeft, MessageSquareWarning, Users, ScanLine } from 'lucide-react'
import FareMeter from '../components/FareMeter'
import StatusBadge from '../components/StatusBadge'
import ConfidenceBadge from '../components/ConfidenceBadge'
import MeterDigits from '../components/MeterDigits'
import FareReceipt from '../components/FareReceipt'

const STATUS_MESSAGE = {
  TYPICAL: 'This quote falls within the estimated typical range for comparable trips.',
  ABOVE_TYPICAL: 'This quote is above the estimated typical range, but not dramatically so.',
  UNUSUALLY_HIGH: 'Based on available comparable observations and trip context, this quote is significantly above the estimated typical range.',
}

const NEXT_ACTIONS = {
  TYPICAL: [
    'This looks like a reasonable price for this trip — proceed with confidence.',
    'You can still ask the driver to confirm the fare before starting the trip.',
  ],
  ABOVE_TYPICAL: [
    'Consider asking the driver about the fare, or comparing with another provider.',
    'Check if surge pricing, tolls, or a longer route explain the difference.',
  ],
  UNUSUALLY_HIGH: [
    'Consider negotiating, asking for a fare breakdown, or trying a metered/app-based alternative.',
    'You can submit what you actually pay afterward to help other travelers.',
  ],
}

function formatTime12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, form } = location.state || {}

  if (!result) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <Info className="mx-auto text-slate" size={32} />
        <h1 className="mt-4 font-display text-xl font-bold text-paper">No analysis to show</h1>
        <p className="mt-2 text-sm text-slate">Start by entering your trip details on the Fair Price Checker.</p>
        <Link to="/checker" className="mt-6 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-ink">
          Go to Fair Price Checker
        </Link>
      </div>
    )
  }

  const isUnusual = result.status === 'UNUSUALLY_HIGH'

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <button onClick={() => navigate('/checker')} className="flex items-center gap-1 text-sm font-medium text-slate hover:text-paper">
        <ArrowLeft size={16} /> Check another price
      </button>

      {/* Summary header */}
      <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-meter text-xs font-semibold uppercase tracking-[0.15em] text-slate">
              {result.city} · {result.service_type}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-paper">Price Analysis</h1>
          </div>
          <StatusBadge status={result.status} size="lg" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-line pt-6 sm:grid-cols-4">
          <Stat icon={MapPin} label="Distance" value={`${result.distance_km} km`} />
          <Stat icon={Clock} label="Time" value={form?.time ? formatTime12h(form.time) : '—'} />
          <Stat icon={Car} label="Service" value={result.service_type} />
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-slate"><span className="opacity-0">·</span>Confidence</p>
            <ConfidenceBadge confidence={result.confidence} />
          </div>
        </div>
      </div>

      {/* Fare meter comparison */}
      <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Your Quote</p>
            <MeterDigits value={result.quoted_price} className="text-3xl font-extrabold text-paper" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate">Estimated Typical Range</p>
            <p className="font-meter text-xl font-bold tabular-nums text-teal">
              <MeterDigits value={result.estimated_range.min} className="text-xl font-bold text-teal" delay={120} duration={700} />
              {' – '}
              <MeterDigits value={result.estimated_range.max} className="text-xl font-bold text-teal" delay={220} duration={700} />
            </p>
          </div>
        </div>

        <div className="mt-8">
          <FareMeter
            rangeMin={result.estimated_range.min}
            rangeMax={result.estimated_range.max}
            quotedPrice={result.quoted_price}
            status={result.status}
          />
        </div>

        <p className={`mt-6 rounded-xl px-4 py-3 text-sm ${isUnusual ? 'bg-coral-soft text-coral' : 'bg-teal-soft text-teal'}`}>
          {STATUS_MESSAGE[result.status]}
        </p>

        {result.low_data_notice && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amberflag/20 bg-amberflag-soft px-4 py-3 text-sm text-amberflag">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{result.low_data_notice}</span>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <h2 className="font-display text-lg font-bold text-paper">Why did we estimate this price?</h2>
        <p className="mt-1 text-sm text-slate">
          Factors below were considered by the model, ranked by how much they contributed to the estimate.
        </p>
        <div className="mt-5 space-y-3">
          {result.explanation.map((factor) => (
            <div key={factor.factor} className="flex items-center gap-4 rounded-xl bg-ink-elevated px-4 py-3">
              <div className="w-28 shrink-0 text-sm font-semibold capitalize text-paper">{factor.factor.replace('_', ' ')}</div>
              <div className="flex-1">
                <p className="text-sm text-slate">{factor.value} — <span className="text-paper/75">{factor.note}</span></p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper/10">
                  <div className="h-full rounded-full bg-signal" style={{ width: `${Math.min(100, factor.importance * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next actions */}
      <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <h2 className="font-display text-lg font-bold text-paper">What can you do next?</h2>
        <ul className="mt-4 space-y-2">
          {NEXT_ACTIONS[result.status].map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" /> {action}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-ink-line pt-6">
          <Link to="/community" className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink-elevated">
            <Users size={16} /> Report what you paid
          </Link>
          <Link to="/scan" className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink-elevated">
            <ScanLine size={16} /> Scan another quote
          </Link>
        </div>
      </div>

      {/* Shareable receipt */}
      <FareReceipt result={result} tripDate={form?.date} />

      {/* Disclaimer */}
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-ink-line bg-ink-soft px-4 py-3 text-xs text-slate">
        <MessageSquareWarning size={16} className="mt-0.5 shrink-0" />
        <span>{result.disclaimer} Dataset: {result.dataset_notice}.</span>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-xs text-slate"><Icon size={12} /> {label}</p>
      <p className="text-sm font-semibold text-paper">{value}</p>
    </div>
  )
}
