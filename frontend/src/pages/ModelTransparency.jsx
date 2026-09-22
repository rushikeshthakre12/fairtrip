import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'
import { getModelInfo } from '../services/api'

export default function ModelTransparency() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getModelInfo().then(setMetrics).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">Transparency</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">How the model works</h1>
      <p className="mt-2 max-w-xl text-sm text-slate">
        Real evaluation metrics from the last training run — not invented figures.
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral-soft px-4 py-3 text-sm text-coral">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {!metrics && !error && (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate"><Loader2 size={16} className="animate-spin" /> Loading model info...</div>
      )}

      {metrics && (
        <>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <MetricCard label="MAE" value={`₹${metrics.mae}`} sub="Mean Absolute Error" />
            <MetricCard label="RMSE" value={`₹${metrics.rmse}`} sub="Root Mean Sq. Error" />
            <MetricCard label="R²" value={metrics.r2} sub="Variance Explained" />
          </div>

          <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-signal" size={20} />
              <h2 className="font-display text-lg font-bold text-paper">Training details</h2>
            </div>
            <dl className="mt-4 divide-y divide-ink/10 text-sm">
              <Row label="Model" value={metrics.model} />
              <Row label="Trained at" value={new Date(metrics.trained_at).toLocaleString()} />
              <Row label="Training rows" value={metrics.n_train_rows} />
              <Row label="Test rows (held out)" value={metrics.n_test_rows} />
              <Row label="Residual std (drives range width)" value={`₹${metrics.residual_std}`} />
              <Row label="Features used" value={metrics.features.join(', ')} />
            </dl>
          </div>

          <div className="mt-6 rounded-card border border-amberflag/20 bg-amberflag-soft p-6 text-sm text-amberflag">
            <strong>Dataset notice:</strong> {metrics.dataset}
          </div>

          <div className="mt-6 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
            <h2 className="font-display text-base font-bold text-paper">Range methodology</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              The predicted price comes directly from the Random Forest model. The
              displayed range is <em>predicted price ± 1 residual standard
              deviation</em>, measured on data the model never saw during training.
              This means the range width reflects the model's actual out-of-sample
              error — not an arbitrary percentage — and will narrow as more
              validated real-world observations are added and the model is
              retrained.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-card border border-ink-line bg-ink-soft p-5 text-center shadow-card">
      <p className="font-meter text-2xl font-extrabold tabular-nums text-paper">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-signal">{label}</p>
      <p className="mt-0.5 text-xs text-slate">{sub}</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-slate">{label}</dt>
      <dd className="text-right font-medium text-paper">{value}</dd>
    </div>
  )
}
