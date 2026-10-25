import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Zap, PenLine, Sparkles } from 'lucide-react'
import { predictPrice, getCities, getServices } from '../services/api'
import AnalyzingOverlay from '../components/AnalyzingOverlay'
import { CITY_LANDMARKS, CITY_NAMES } from '../data/landmarks'
import { estimateDistanceKm } from '../utils/distance'

const FALLBACK_CITIES = CITY_NAMES
const FALLBACK_SERVICES = ['Taxi', 'Auto']
const VEHICLE_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Standard']

const todayStr = () => new Date().toISOString().slice(0, 10)

// One-click presets for live demos. Only the INPUTS are preset (route, time, the
// price a driver quoted) — the estimate and status always come from the real model.
const DEMO_SCENARIOS = [
  { label: 'Mumbai · Airport → Andheri', city: 'Mumbai', from: 'Chhatrapati Shivaji Airport (T2)', to: 'Andheri', time: '20:30', quote: 900 },
  { label: 'Mumbai · CST → Bandra', city: 'Mumbai', from: 'CST Station', to: 'Bandra', time: '11:00', quote: 430 },
  { label: 'Nagpur · Airport → Sitabuldi', city: 'Nagpur', from: 'Dr. Ambedkar Airport', to: 'Sitabuldi', time: '21:00', quote: 300 },
  { label: 'Delhi · IGI → Connaught Place', city: 'Delhi', from: 'IGI Airport (T3)', to: 'Connaught Place', time: '23:30', quote: 850 },
  { label: 'Bengaluru · Airport → MG Road', city: 'Bengaluru', from: 'Kempegowda Airport', to: 'MG Road', time: '06:30', quote: 920 },
  { label: 'Goa · Airport → Calangute', city: 'Goa', from: 'Dabolim Airport', to: 'Calangute', time: '22:00', quote: 1050 },
]

export default function Checker() {
  const navigate = useNavigate()
  const [cities, setCities] = useState(FALLBACK_CITIES)
  const [services, setServices] = useState(FALLBACK_SERVICES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [manualDistance, setManualDistance] = useState(false)

  const [form, setForm] = useState({
    city: 'Mumbai',
    service_type: 'Taxi',
    pickup_location: '',
    destination: '',
    distance_km: '15',
    date: todayStr(),
    time: '20:30',
    quoted_price: '900',
    vehicle_type: '',
  })

  useEffect(() => {
    getCities().then((data) => data.length && setCities(data.map((c) => c.name))).catch(() => {})
    getServices().then((data) => data.length && setServices(data.map((s) => s.name))).catch(() => {})
  }, [])

  const landmarks = CITY_LANDMARKS[form.city] || []
  const hasLandmarks = landmarks.length > 0

  const autoDistance = useMemo(() => {
    if (manualDistance || !hasLandmarks) return null
    const pickup = landmarks.find((l) => l.name === form.pickup_location)
    const destination = landmarks.find((l) => l.name === form.destination)
    return estimateDistanceKm(pickup, destination)
  }, [form.pickup_location, form.destination, manualDistance, hasLandmarks, landmarks])

  // Keep distance_km in sync with the auto-calculated value whenever it's available
  useEffect(() => {
    if (autoDistance != null) {
      setForm((prev) => ({ ...prev, distance_km: String(autoDistance) }))
    }
  }, [autoDistance])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function applyScenario(s) {
    setManualDistance(false)
    setError(null)
    setForm((prev) => ({
      ...prev,
      city: s.city,
      service_type: 'Taxi',
      pickup_location: s.from,
      destination: s.to,
      time: s.time,
      quoted_price: String(s.quote),
      vehicle_type: 'Sedan',
    }))
  }

  function handleCityChange(city) {
    setForm((prev) => ({ ...prev, city, pickup_location: '', destination: '' }))
  }

  function validate() {
    if (!form.city) return 'Please select a city.'
    if (!form.service_type) return 'Please select a service.'
    if (!form.distance_km || Number(form.distance_km) <= 0) return 'Distance must be a positive number.'
    if (!form.date) return 'Please choose a date.'
    if (!form.time) return 'Please choose a time.'
    if (!form.quoted_price || Number(form.quoted_price) <= 0) return 'Quoted price must be a positive number.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const started = Date.now()
      const result = await predictPrice({
        city: form.city,
        service_type: form.service_type,
        distance_km: Number(form.distance_km),
        date: form.date,
        time: `${form.time}:00`,
        quoted_price: Number(form.quoted_price),
        vehicle_type: form.vehicle_type || null,
        pickup_location: form.pickup_location || null,
        destination: form.destination || null,
      })
      const wait = 900 - (Date.now() - started)
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      navigate('/result', { state: { result, form } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 stagger">
      <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Fair Price Checker</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">Enter your trip details</h1>
      <p className="mt-2 text-sm text-slate">
        We'll estimate a typical price range and compare it to your quote.
      </p>

      <div className="mt-6">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate">
          <Sparkles size={13} className="text-signal" /> Demo scenarios — click to fill the form
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((s) => (
            <button
              type="button"
              key={s.label}
              onClick={() => applyScenario(s)}
              className="rounded-full border border-ink-line bg-ink-soft px-3.5 py-1.5 text-xs font-medium text-paper transition-all hover:-translate-y-0.5 hover:border-signal hover:text-signal"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="City" required>
            <select className="input" value={form.city} onChange={(e) => handleCityChange(e.target.value)}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Service Type" required>
            <select className="input" value={form.service_type} onChange={(e) => update('service_type', e.target.value)}>
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {hasLandmarks && !manualDistance ? (
            <>
              <Field label="From">
                <select className="input" value={form.pickup_location} onChange={(e) => update('pickup_location', e.target.value)}>
                  <option value="">Select pickup point</option>
                  {landmarks.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
              </Field>
              <Field label="To">
                <select className="input" value={form.destination} onChange={(e) => update('destination', e.target.value)}>
                  <option value="">Select destination</option>
                  {landmarks.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
                </select>
              </Field>
            </>
          ) : null}

          <Field label="Distance (km)" required>
            <div className="relative">
              <input
                type="number" min="0.1" step="0.1"
                className="input pr-24 font-meter tabular-nums"
                value={form.distance_km}
                readOnly={autoDistance != null}
                onChange={(e) => update('distance_km', e.target.value)}
              />
              {autoDistance != null && (
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-signal/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-signal">
                  <Zap size={11} /> Auto
                </span>
              )}
            </div>
            {hasLandmarks && (
              <button
                type="button"
                onClick={() => setManualDistance((v) => !v)}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate hover:text-signal"
              >
                <PenLine size={12} />
                {manualDistance ? 'Use From / To instead' : 'Enter distance manually'}
              </button>
            )}
          </Field>

          <Field label="Quoted Price (₹)" required>
            <input
              type="number" min="1" step="1" className="input"
              value={form.quoted_price} onChange={(e) => update('quoted_price', e.target.value)}
            />
          </Field>

          <Field label="Date" required>
            <input type="date" className="input" value={form.date} onChange={(e) => update('date', e.target.value)} />
          </Field>

          <Field label="Time" required>
            <input type="time" className="input" value={form.time} onChange={(e) => update('time', e.target.value)} />
          </Field>

          <Field label="Vehicle Type (optional)">
            <select className="input" value={form.vehicle_type} onChange={(e) => update('vehicle_type', e.target.value)}>
              <option value="">Not specified</option>
              {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>

          {(!hasLandmarks || manualDistance) && (
            <>
              <Field label="Pickup Location (optional)">
                <input type="text" className="input" placeholder="e.g. Airport" value={form.pickup_location} onChange={(e) => update('pickup_location', e.target.value)} />
              </Field>
              <Field label="Destination (optional)">
                <input type="text" className="input" placeholder="e.g. Bandra" value={form.destination} onChange={(e) => update('destination', e.target.value)} />
              </Field>
            </>
          )}
        </div>

        {autoDistance != null && (
          <p className="mt-3 text-xs text-slate">
            Distance auto-calculated from known landmark coordinates (straight-line × road factor) — an estimate, not a routed distance.
          </p>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral-soft px-4 py-3 text-sm text-coral">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-signal px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-signal/90 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : 'Analyze Price'}
        </button>
      </form>
      {loading && <AnalyzingOverlay />}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-paper">
        {label} {required && <span className="text-coral">*</span>}
      </span>
      {children}
    </label>
  )
}
