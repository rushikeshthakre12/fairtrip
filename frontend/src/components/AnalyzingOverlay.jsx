import { createPortal } from 'react-dom'

/** Full-screen "analyzing" state with a sweeping fare-meter needle. */
export default function AnalyzingOverlay() {
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink/80 backdrop-blur-md"
    >
      <svg width="180" height="110" viewBox="0 0 180 110" aria-hidden="true">
        <path d="M20 95 A70 70 0 0 1 160 95" fill="none" stroke="#252C28" strokeWidth="10" strokeLinecap="round" />
        <path d="M20 95 A70 70 0 0 1 90 25" fill="none" stroke="#39FF88" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M90 25 A70 70 0 0 1 130 40" fill="none" stroke="#F5C451" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <path d="M130 40 A70 70 0 0 1 160 95" fill="none" stroke="#FF5C5C" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
        <g className="needle" style={{ transformOrigin: '90px 95px' }}>
          <line x1="90" y1="95" x2="90" y2="36" stroke="#F3F7F4" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="90" cy="95" r="8" fill="#F3F7F4" />
      </svg>
      <p className="mt-6 font-display text-lg font-bold text-paper">Analyzing your trip…</p>
      <p className="mt-1 text-sm text-slate">Comparing your quote with the model's typical range</p>
    </div>,
    document.body,
  )
}
