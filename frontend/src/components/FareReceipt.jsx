import { Printer, Gauge } from 'lucide-react'

const STATUS_LABEL = {
  TYPICAL: 'TYPICAL',
  ABOVE_TYPICAL: 'ABOVE TYPICAL',
  UNUSUALLY_HIGH: 'UNUSUALLY HIGH',
}

function formatRupee(v) {
  return `Rs. ${Math.round(v).toLocaleString('en-IN')}`
}

function ticketNumber(result) {
  // Deterministic, presentational only — not a real transaction ID.
  const seed = `${result.city}${result.service_type}${result.quoted_price}${result.predicted_price}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return `FT-${(hash % 900000 + 100000)}`
}

export default function FareReceipt({ result, tripDate }) {
  const handlePrint = () => window.print()

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-paper">Fare Receipt</h2>
        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-1.5 rounded-full border border-ink-line px-4 py-2 text-xs font-semibold text-paper hover:bg-ink-elevated"
        >
          <Printer size={14} /> Print / Save
        </button>
      </div>
      <p className="print:hidden mt-1 text-xs text-slate">
        A shareable summary of this analysis — not a payment record or booking confirmation.
      </p>

      <div id="fare-receipt" className="relative mx-auto mt-4 max-w-sm">
        <div className="rounded-t-lg border border-b-0 border-ink/15 bg-white px-6 pb-4 pt-6 shadow-card">
          <div className="flex items-center justify-center gap-1.5 text-ink">
            <Gauge size={16} />
            <span className="font-display text-sm font-extrabold tracking-tight">FAIRTRIP</span>
          </div>
          <p className="mt-0.5 text-center font-meter text-[10px] uppercase tracking-[0.25em] text-slate">
            Price Estimate Receipt
          </p>

          <div className="mt-4 border-t border-dashed border-ink/20 pt-4 font-meter text-xs">
            <ReceiptRow label="Ticket No." value={ticketNumber(result)} />
            <ReceiptRow label="Date" value={tripDate || '—'} />
            <ReceiptRow label="City" value={result.city} />
            <ReceiptRow label="Service" value={result.service_type} />
            <ReceiptRow label="Distance" value={`${result.distance_km} km`} />
          </div>

          <div className="mt-4 border-t border-dashed border-ink/20 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="font-meter text-xs uppercase tracking-wide text-slate">Your Quote</span>
              <span className="font-meter text-lg font-extrabold tabular-nums text-ink">{formatRupee(result.quoted_price)}</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-meter text-xs uppercase tracking-wide text-slate">Typical Range</span>
              <span className="font-meter text-sm font-semibold tabular-nums text-teal">
                {formatRupee(result.estimated_range.min)}–{formatRupee(result.estimated_range.max)}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-ink/20 pt-4 text-center">
            <span className="font-meter text-sm font-extrabold tracking-widest text-ink">{STATUS_LABEL[result.status]}</span>
            <p className="mt-1 font-meter text-[10px] text-slate">Confidence: {result.confidence}</p>
          </div>

          <p className="mt-4 border-t border-dashed border-ink/20 pt-3 text-center font-meter text-[9px] leading-snug text-slate">
            Estimate only. Not a legally correct price. Not proof of fraud.
          </p>
        </div>

        {/* perforated tear edge */}
        <div
          className="h-4 rounded-b-lg border border-t-0 border-ink/15 bg-white shadow-card"
          style={{
            maskImage: 'radial-gradient(circle 6px at 6px 0, transparent 6px, black 6.5px)',
            maskRepeat: 'repeat-x',
            maskSize: '16px 100%',
            WebkitMaskImage: 'radial-gradient(circle 6px at 6px 0, transparent 6px, black 6.5px)',
            WebkitMaskRepeat: 'repeat-x',
            WebkitMaskSize: '16px 100%',
          }}
        />
      </div>
    </div>
  )
}

function ReceiptRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="uppercase tracking-wide text-slate">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}
