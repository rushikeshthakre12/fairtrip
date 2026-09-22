import { useEffect, useState } from 'react'
import { Loader2, Check, X, ShieldAlert } from 'lucide-react'
import { listCommunityReports, validateReport } from '../services/api'

export default function Admin() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actioning, setActioning] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await listCommunityReports('PENDING')
      setReports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDecision(id, decision) {
    setActioning(id)
    try {
      await validateReport(id, decision)
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setActioning(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-signal" size={20} />
        <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Admin</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">Validation Queue</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">
        Only VALIDATED community reports become eligible for the ML training
        dataset. Review each submission before approving.
      </p>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate"><Loader2 size={16} className="animate-spin" /> Loading queue...</div>
      ) : reports.length === 0 ? (
        <div className="mt-8 rounded-card border border-ink-line bg-ink-soft p-8 text-center text-sm text-slate shadow-card">
          Nothing pending — the queue is clear.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-card border border-ink-line bg-ink-soft p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-paper">{r.city} · {r.service_type} · {r.distance_km} km</p>
                  <p className="mt-0.5 text-xs text-slate">{r.trip_date} at {r.trip_time} {r.vehicle_type ? `· ${r.vehicle_type}` : ''}</p>
                  {r.notes && <p className="mt-1 text-xs italic text-slate">"{r.notes}"</p>}
                </div>
                <span className="font-meter text-lg font-bold tabular-nums text-paper">₹{Math.round(r.price).toLocaleString('en-IN')}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  disabled={actioning === r.id}
                  onClick={() => handleDecision(r.id, 'VALIDATED')}
                  className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <Check size={14} /> Validate
                </button>
                <button
                  disabled={actioning === r.id}
                  onClick={() => handleDecision(r.id, 'REJECTED')}
                  className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
