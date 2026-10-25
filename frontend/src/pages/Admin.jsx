import { useCallback, useEffect, useState } from 'react'
import { Loader2, Check, X, ShieldAlert, Trash2 } from 'lucide-react'
import { listCommunityReports, validateReport, deleteReport } from '../services/api'

const TABS = ['PENDING', 'VALIDATED', 'REJECTED', 'ALL']
const STATUS_STYLE = {
  PENDING: 'bg-amberflag-soft text-amberflag',
  VALIDATED: 'bg-teal-soft text-teal',
  REJECTED: 'bg-coral-soft text-coral',
}
const EMPTY_TEXT = {
  PENDING: 'Nothing pending. The queue is clear.',
  VALIDATED: 'No validated reports yet.',
  REJECTED: 'No rejected reports.',
  ALL: 'No reports yet.',
}

export default function Admin() {
  const [tab, setTab] = useState('PENDING')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setReports(await listCommunityReports(tab === 'ALL' ? undefined : tab))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  async function decide(id, decision) {
    setBusyId(id)
    setError(null)
    try {
      await validateReport(id, decision)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(r) {
    const ok = window.confirm(
      `Delete this report permanently?\n\n${r.city} · ${r.service_type} · ${r.distance_km} km · ₹${Math.round(r.price)}\n\nIf it was validated, it is also removed from the training data.`,
    )
    if (!ok) return
    setBusyId(r.id)
    setError(null)
    try {
      await deleteReport(r.id)
      setReports((prev) => prev.filter((x) => x.id !== r.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-signal" size={20} />
        <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Admin</p>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">Report Management</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">
        Only VALIDATED reports become eligible for the ML training dataset. You can validate, reject or delete any report.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === t ? 'border-signal bg-signal text-ink' : 'border-ink-line text-slate hover:text-paper'
            }`}
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-slate">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-8 rounded-card border border-ink-line bg-ink-soft p-8 text-center text-sm text-slate shadow-card">
          {EMPTY_TEXT[tab]}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-card border border-ink-line bg-ink-soft p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-paper">
                    {r.city} · {r.service_type} · {r.distance_km} km
                  </p>
                  <p className="mt-0.5 text-xs text-slate">
                    {r.trip_date} at {r.trip_time}
                    {r.vehicle_type ? ` · ${r.vehicle_type}` : ''}
                  </p>
                  {r.notes && <p className="mt-1 text-xs italic text-slate">"{r.notes}"</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-meter text-lg font-bold tabular-nums text-paper">
                    ₹{Math.round(r.price).toLocaleString('en-IN')}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => decide(r.id, 'VALIDATED')}
                      className="flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                    >
                      <Check size={14} /> Validate
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => decide(r.id, 'REJECTED')}
                      className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => remove(r)}
                  className="flex items-center gap-1.5 rounded-full border border-coral/40 px-4 py-2 text-xs font-semibold text-coral transition-colors hover:bg-coral-soft disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}