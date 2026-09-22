import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Loader2, AlertCircle, ScanLine, CheckCircle2 } from 'lucide-react'
import { scanImage, predictPrice } from '../services/api'

const CITIES = ['Mumbai', 'Nagpur', 'Delhi', 'Bengaluru', 'Pune', 'Jaipur', 'Goa']
const SERVICES = ['Taxi', 'Auto']

export default function ScanCheck() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)

  const [confirm, setConfirm] = useState({
    city: 'Mumbai',
    service_type: 'Taxi',
    distance_km: '',
    quoted_price: '',
  })

  async function handleFile(file) {
    if (!file) return
    setError(null)
    setOcrResult(null)
    setPreview(URL.createObjectURL(file))
    setScanning(true)
    try {
      const data = await scanImage(file)
      setOcrResult(data)
      setConfirm((prev) => ({
        ...prev,
        service_type: data.extracted_service || prev.service_type,
        quoted_price: data.extracted_price ? String(data.extracted_price) : prev.quoted_price,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!confirm.distance_km || Number(confirm.distance_km) <= 0) {
      setError('Please enter a valid distance before analyzing.')
      return
    }
    if (!confirm.quoted_price || Number(confirm.quoted_price) <= 0) {
      setError('Please enter a valid quoted price before analyzing.')
      return
    }
    setError(null)
    try {
      const now = new Date()
      const result = await predictPrice({
        city: confirm.city,
        service_type: confirm.service_type,
        distance_km: Number(confirm.distance_km),
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 8),
        quoted_price: Number(confirm.quoted_price),
      })
      navigate('/result', { state: { result, form: { time: now.toTimeString().slice(0, 5), date: now.toISOString().slice(0, 10) } } })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Scan & Check</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">Upload a rate card or quotation</h1>
      <p className="mt-2 text-sm text-slate">
        We'll extract the text with OCR — always double-check the result before analyzing.
      </p>

      <div
        className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-ink-line bg-ink-soft p-10 text-center transition-colors hover:border-signal"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Uploaded preview" className="max-h-56 rounded-lg object-contain" />
        ) : (
          <>
            <Upload className="text-slate" size={28} />
            <p className="mt-3 text-sm font-medium text-paper">Click to upload an image</p>
            <p className="mt-1 text-xs text-slate">PNG, JPG, or WEBP</p>
          </>
        )}
        <input
          ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {scanning && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate">
          <Loader2 size={16} className="animate-spin" /> Extracting text...
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral-soft px-4 py-3 text-sm text-coral">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {ocrResult && (
        <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
          <div className="flex items-center gap-2 rounded-xl border border-amberflag/20 bg-amberflag-soft px-4 py-3 text-sm text-amberflag">
            <ScanLine size={16} className="shrink-0" /> {ocrResult.verification_notice}
          </div>

          {ocrResult.raw_text && (
            <details className="mt-4 text-xs text-slate">
              <summary className="cursor-pointer font-medium">View raw extracted text</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-ink-elevated p-3">{ocrResult.raw_text}</pre>
            </details>
          )}

          <form onSubmit={handleAnalyze} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-paper">City</span>
              <select className="input" value={confirm.city} onChange={(e) => setConfirm({ ...confirm, city: e.target.value })}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-paper">Service</span>
              <select className="input" value={confirm.service_type} onChange={(e) => setConfirm({ ...confirm, service_type: e.target.value })}>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-paper">Distance (km)</span>
              <input type="number" min="0.1" step="0.1" className="input" value={confirm.distance_km}
                onChange={(e) => setConfirm({ ...confirm, distance_km: e.target.value })} placeholder="e.g. 12" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-paper">Extracted Price (₹) — edit if wrong</span>
              <input type="number" min="1" className="input" value={confirm.quoted_price}
                onChange={(e) => setConfirm({ ...confirm, quoted_price: e.target.value })} />
            </label>

            <button type="submit" className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-ink hover:bg-signal/90">
              <CheckCircle2 size={18} /> Confirm & Analyze
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
