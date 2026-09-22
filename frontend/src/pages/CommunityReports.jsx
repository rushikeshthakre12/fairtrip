import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Users, Clock } from 'lucide-react'
import { submitCommunityReport, listCommunityReports } from '../services/api'

const CITIES = ['Mumbai', 'Nagpur', 'Delhi', 'Bengaluru', 'Pune', 'Jaipur', 'Goa']
const SERVICES = ['Taxi', 'Auto']

const STATUS_STYLE = {
  PENDING: 'bg-amberflag-soft text-amberflag',
  VALIDATED: 'bg-teal-soft text-teal',
  REJECTED: 'bg-coral-soft text-coral',
}

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function CommunityReports() {
  const [form, setForm] = useState({
    city: 'Mumbai',
    service_type: 'Taxi',
    distance_km: '',
    price: '',
    trip_date: todayStr(),
    trip_time: '18:00',
    vehicle_type: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)

  async function loadReports() {
    setLoadingReports(true)
    try {
      const data = await listCommunityReports()
      setReports(data)
    } catch {
      // Non-blocking — the form still works even if the list fails to load
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => { loadReports() }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.distance_km || Number(form.distance_km) <= 0) return setError('Distance must be positive.')
    if (!form.price || Number(form.price) <= 0) return setError('Price must be positive.')

    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await submitCommunityReport({
        city: form.city,
        service_type: form.service_type,
        distance_km: Number(form.distance_km),
        price: Number(form.price),
        trip_date: form.trip_date,
        trip_time: `${form.trip_time}:00`,
        vehicle_type: form.vehicle_type || null,
        notes: form.notes || null,
      })
      setSuccess(`Thanks! Your report was submitted and is now ${result.status.toLowerCase()} review.`)
      setForm((prev) => ({ ...prev, distance_km: '', price: '', notes: '' }))
      loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Community Reports</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">What did you actually pay?</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">
        Share real trips you've taken. Reports are reviewed before they influence
        future estimates — submissions never automatically become training data.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">City</span>
            <select className="input" value={form.city} onChange={(e) => update('city', e.target.value)}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">Service</span>
            <select className="input" value={form.service_type} onChange={(e) => update('service_type', e.target.value)}>
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">Distance (km)</span>
            <input type="number" min="0.1" step="0.1" className="input" value={form.distance_km} onChange={(e) => update('distance_km', e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">Price Paid (₹)</span>
            <input type="number" min="1" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">Date</span>
            <input type="date" className="input" value={form.trip_date} onChange={(e) => update('trip_date', e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper">Time</span>
            <input type="time" className="input" value={form.trip_time} onChange={(e) => update('trip_time', e.target.value)} />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-paper">Notes (optional)</span>
            <textarea rows={2} className="input" placeholder="e.g. prepaid counter, negotiated fare, app-based booking..." value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </label>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral-soft px-4 py-3 text-sm text-coral">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-teal/20 bg-teal-soft px-4 py-3 text-sm text-teal">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> <span>{success}</span>
          </div>
        )}

        <button type="submit" disabled={submitting} className="mt-6 flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-ink hover:bg-signal/90 disabled:opacity-60">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : <><Users size={18} /> Submit Report</>}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-paper">Recent submissions</h2>
        {loadingReports ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate"><Loader2 size={16} className="animate-spin" /> Loading...</div>
        ) : reports.length === 0 ? (
          <p className="mt-4 text-sm text-slate">No reports yet — be the first to contribute.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {reports.slice(0, 15).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink-soft px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-paper">{r.city} · {r.service_type} · {r.distance_km} km</p>
                  <p className="flex items-center gap-1 text-xs text-slate"><Clock size={11} /> {r.trip_date} at {r.trip_time}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-meter text-sm font-bold tabular-nums text-paper">₹{Math.round(r.price).toLocaleString('en-IN')}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
