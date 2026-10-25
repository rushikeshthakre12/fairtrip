/**
 * A dark "stacked card" illustration in the spirit of a customize-your-
 * experience panel — reimagined for FairTrip in a green-on-black palette:
 * instead of tool/tech pills, it shows the trip factors the model
 * considered, with the ones that contributed most to the estimate
 * highlighted in green and a cursor calling one out. Purely illustrative
 * (not live data).
 */
export default function ExplainabilityShowcase() {
  return (
    <svg
      viewBox="0 0 700 560"
      className="h-auto w-full max-w-xl"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of trip-factor pills, with distance, time, and taxi highlighted as top contributors to a price estimate"
    >
      {/* ---- stacked cards behind (depth effect) ---- */}
      <rect x="48" y="48" width="560" height="440" rx="28" fill="#111111" stroke="rgba(255,255,255,0.06)" />
      <rect x="34" y="34" width="560" height="440" rx="28" fill="#111111" stroke="rgba(255,255,255,0.1)" />

      {/* ---- main card ---- */}
      <rect x="20" y="20" width="560" height="440" rx="28" fill="#0A0A0A" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />

      {/* header: profile glyph */}
      <circle cx="72" cy="72" r="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" fill="none" />
      <circle cx="72" cy="67" r="5.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" fill="none" />
      <path d="M61 82c2-6 7-9 11-9s9 3 11 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* header: FairTrip gauge glyph + meter marks, echoing the original asterisk/dash/slash cluster */}
      <g stroke="#22C55E" strokeWidth="2" strokeLinecap="round">
        <circle cx="330" cy="72" r="13" fill="none" opacity="0.9" />
        <path d="M330 72 L337 63" />
        <line x1="360" y1="65" x2="374" y2="65" />
        <line x1="360" y1="72" x2="374" y2="72" />
        <line x1="360" y1="79" x2="374" y2="79" />
        <line x1="392" y1="60" x2="400" y2="84" opacity="0.7" />
        <line x1="404" y1="60" x2="412" y2="84" opacity="0.7" />
        <line x1="416" y1="60" x2="424" y2="84" opacity="0.7" />
      </g>

      {/* divider */}
      <line x1="20" y1="116" x2="580" y2="116" stroke="rgba(255,255,255,0.1)" />

      {/* caption row */}
      <text x="60" y="146" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily="Inter, sans-serif" letterSpacing="0.5">
        FACTORS CONSIDERED FOR THIS ESTIMATE
      </text>

      {/* ---- pills ---- */}
      {/* Row 1 */}
      <Pill x={60} y={168} w={150} h={56} label="Mumbai" />
      <Pill x={228} y={168} w={140} h={56} label="15 km" highlight />

      {/* Row 2 */}
      <Pill x={60} y={246} w={210} h={56} label="Night Time" highlight />
      <Pill x={288} y={246} w={130} h={56} label="Sedan" />

      {/* Row 3 */}
      <Pill x={60} y={324} w={140} h={56} label="Weekday" />
      <Pill x={214} y={324} w={110} h={56} label="Auto" />
      <Pill x={338} y={324} w={120} h={56} label="Taxi" highlight />

      {/* legend */}
      <circle cx="66" cy="410" r="5" fill="#22C55E" />
      <text x="80" y="414" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Inter, sans-serif">
        Contributed most to this estimate
      </text>

      {/* cursor pointing at the "Taxi" pill, layered shadow + green fill like the reference */}
      <g transform="translate(452, 372) rotate(-28)">
        <path d="M0 0 L0 34 L8 26 L14 39 L20 36.5 L14 24 L25 24 Z" fill="#000000" transform="translate(3,3)" />
        <path d="M0 0 L0 34 L8 26 L14 39 L20 36.5 L14 24 L25 24 Z" fill="#22C55E" />
      </g>
    </svg>
  )
}

function Pill({ x, y, w, h, label, highlight }) {
  const fill = highlight ? '#22C55E' : '#161616'
  const stroke = highlight ? 'none' : 'rgba(255,255,255,0.16)'
  const textFill = highlight ? '#0A0A0A' : '#F2F2F2'
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={stroke === 'none' ? 0 : 1.4} />
      <text
        x={x + w / 2}
        y={y + h / 2 + 5}
        textAnchor="middle"
        fill={textFill}
        fontSize="17"
        fontWeight="600"
        fontFamily="Sora, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}
