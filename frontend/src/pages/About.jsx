import { ShieldOff, ShieldCheck, Compass } from 'lucide-react'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">About</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-paper">What FairTrip is — and isn't</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-card border border-teal/20 bg-teal-soft p-6">
          <ShieldCheck className="text-teal" size={24} />
          <h2 className="mt-3 font-display font-bold text-paper">FairTrip is</h2>
          <ul className="mt-3 space-y-2 text-sm text-paper/75">
            <li>A decision-support tool</li>
            <li>A price-intelligence platform</li>
            <li>An explainable ML system</li>
            <li>A community-powered system</li>
          </ul>
        </div>
        <div className="rounded-card border border-coral/20 bg-coral-soft p-6">
          <ShieldOff className="text-coral" size={24} />
          <h2 className="mt-3 font-display font-bold text-paper">FairTrip is not</h2>
          <ul className="mt-3 space-y-2 text-sm text-paper/75">
            <li>A taxi booking platform</li>
            <li>A fraud detector</li>
            <li>A system that knows the legally correct price</li>
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-paper">The problem</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          A tourist arrives in an unfamiliar city and receives a price quote from a
          local transport provider. They don't know what the typical local price
          is, whether time or location affects the price, or what similar
          travelers have paid. This information asymmetry leads to price
          uncertainty — and often, a worse travel experience than it needs to be.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          FairTrip estimates a typical local price range using a machine learning
          model trained on trip data, and shows travelers exactly where their
          quote falls relative to that range — with the reasoning behind the
          estimate made visible, not hidden.
        </p>
      </div>

      <div className="mt-10 rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Compass className="text-signal" size={20} />
          <h2 className="font-display text-lg font-bold text-paper">Future Scope</h2>
        </div>
        <p className="mt-2 text-sm text-slate">
          These are not implemented yet — the current prototype focuses on Taxi
          and Auto/Rickshaw pricing only:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Hotels', 'Food & Restaurants', 'Car Rentals', 'Guides', 'Activities',
            'National Expansion', 'International Expansion', 'Verified Provider Partnerships',
            'Official Rate Cards'].map((item) => (
            <span key={item} className="rounded-full border border-ink-line bg-ink-elevated px-3 py-1 text-xs font-medium text-slate">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
