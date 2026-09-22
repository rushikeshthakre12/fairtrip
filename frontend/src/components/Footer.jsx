import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper/70">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold text-paper">
              FAIR<span className="text-signal">TRIP</span>
            </div>
            <p className="mt-2 max-w-xs text-sm">
              Know the price. Travel with confidence. FairTrip is a decision-support
              tool — not a booking platform, not a fraud detector.
            </p>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper/50">Product</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/checker" className="hover:text-signal">Fair Price Checker</Link></li>
              <li><Link to="/scan" className="hover:text-signal">Scan & Check</Link></li>
              <li><Link to="/community" className="hover:text-signal">Community Reports</Link></li>
              <li><Link to="/model" className="hover:text-signal">Model Transparency</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-paper/50">Company</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-signal">About FairTrip</Link></li>
              <li><Link to="/admin" className="hover:text-signal">Admin / Validation</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
          FairTrip is a prototype. Estimates are informational only and do not
          determine a legally correct price.
        </div>
      </div>
    </footer>
  )
}
