const STATUS_COLORS = {
  TYPICAL: { bar: 'bg-teal', text: 'text-teal', soft: 'bg-teal-soft' },
  ABOVE_TYPICAL: { bar: 'bg-amberflag', text: 'text-amberflag', soft: 'bg-amberflag-soft' },
  UNUSUALLY_HIGH: { bar: 'bg-coral', text: 'text-coral', soft: 'bg-coral-soft' },
}

function formatRupee(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export default function FareMeter({ rangeMin, rangeMax, quotedPrice, status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.TYPICAL
  const ceiling = Math.max(quotedPrice, rangeMax) * 1.15
  const pct = (value) => `${Math.min(100, (value / ceiling) * 100)}%`

  return (
    <div className="w-full">
      <div className="relative h-16 w-full">
        {/* dashed meter track — signature motif */}
        <div className="meter-track absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full" />

        {/* typical range segment */}
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-teal/70"
          style={{ left: pct(rangeMin), width: `calc(${pct(rangeMax)} - ${pct(rangeMin)})` }}
        />

        {/* range labels */}
        <div className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(rangeMin) }}>
          <span className="font-meter text-xs font-semibold text-teal tabular-nums">{formatRupee(rangeMin)}</span>
        </div>
        <div className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(rangeMax) }}>
          <span className="font-meter text-xs font-semibold text-teal tabular-nums">{formatRupee(rangeMax)}</span>
        </div>

        {/* quote marker */}
        <div className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center" style={{ left: pct(quotedPrice) }}>
          <span className={`font-meter text-sm font-bold tabular-nums ${colors.text}`}>{formatRupee(quotedPrice)}</span>
          <div className={`mt-1 h-5 w-1 rounded-full ${colors.bar}`} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal/70" /> Typical Range
        </span>
        <span className={`flex items-center gap-1.5 font-semibold ${colors.text}`}>
          <span className={`h-2 w-2 rounded-full ${colors.bar}`} /> Your Quote
        </span>
      </div>
    </div>
  )
}
