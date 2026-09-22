const STATUS_CONFIG = {
  TYPICAL: { label: 'Typical', className: 'bg-teal-soft text-teal border-teal/20' },
  ABOVE_TYPICAL: { label: 'Above Typical', className: 'bg-amberflag-soft text-amberflag border-amberflag/20' },
  UNUSUALLY_HIGH: { label: 'Unusually High', className: 'bg-coral-soft text-coral border-coral/20' },
}

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TYPICAL
  const sizeClass = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wide ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  )
}
