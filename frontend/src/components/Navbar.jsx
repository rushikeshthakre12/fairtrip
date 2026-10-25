import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Gauge, Menu, Pause, Play, X } from 'lucide-react'
import { readMotionPref, writeMotionPref } from '../background/motion'

const NAV_LINKS = [
  { to: '/checker', label: 'Check a Price' },
  { to: '/scan', label: 'Scan & Check' },
  { to: '/community', label: 'Community Reports' },
  { to: '/model', label: 'Transparency' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [motion, setMotion] = useState(readMotionPref())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  function toggleMotion() {
    const next = !motion
    setMotion(next)
    writeMotionPref(next)
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'border-ink-line bg-ink/85 shadow-card' : 'border-transparent bg-ink/40'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-soft text-signal transition-transform duration-300 group-hover:rotate-12">
            <Gauge size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-paper">
            FAIR<span className="text-signal">TRIP</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:bg-signal after:transition-transform after:duration-300 hover:text-paper ${
                  active ? 'text-paper after:scale-x-100' : 'text-slate after:scale-x-0 hover:after:scale-x-100'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMotion}
            title={motion ? 'Pause background animation' : 'Play background animation'}
            aria-label={motion ? 'Pause background animation' : 'Play background animation'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-slate transition-colors hover:border-signal hover:text-signal"
          >
            {motion ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <Link
            to="/checker"
            className="hidden rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-signal/90 sm:inline-block"
          >
            Check a Price
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-paper md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="fade-up border-t border-ink-line bg-ink/95 px-5 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="block py-2.5 text-sm font-medium text-paper hover:text-signal">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
