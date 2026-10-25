const CONFIDENCE_CONFIG = {
  HIGH: { label: 'High Confidence', dots: 3 },
  MEDIUM: { label: 'Medium Confidence', dots: 2 },
  LOW: { label: 'Low Confidence', dots: 1 },
}

export default function ConfidenceBadge({ confidence }) {
  const config = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.LOW

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate">
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-2.5 w-1.5 rounded-sm ${i <= config.dots ? 'bg-signal' : 'bg-paper/15'}`}
          />
        ))}
      </div>
      {config.label}
    </div>
  )
}
