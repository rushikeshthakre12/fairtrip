import { Link, useLocation } from 'react-router-dom'
import { Gauge } from 'lucide-react'

const NAV_LINKS = [
  { to: '/checker', label: 'Check a Price' },
  { to: '/scan', label: 'Scan & Check' },
  { to: '/community', label: 'Community Reports' },
  { to: '/model', label: 'Transparency' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-soft text-signal">
            <Gauge size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-paper">
            FAIR<span className="text-signal">TRIP</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-paper ${
                location.pathname === link.to ? 'text-paper' : 'text-slate'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/checker"
          className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-signal/90"
        >
          Check a Price
        </Link>
      </div>
    </header>
  )
}
