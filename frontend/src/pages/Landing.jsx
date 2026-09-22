import { Link } from 'react-router-dom'
import { ArrowRight, ScanLine, Users, ShieldCheck, MessageCircleQuestion } from 'lucide-react'
import LiveDemoWidget from '../components/LiveDemoWidget'
import ExplainabilityShowcase from '../components/ExplainabilityShowcase'

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal">
                AI-Powered Fair Price Intelligence
              </p>
              <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Know the price.
                <br />
                Travel with <span className="text-signal">confidence.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-paper/70">
                A local quotes you a price. FairTrip shows you the typical range for
                trips like yours — so you can decide with information, not guesswork.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/checker"
                  className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Check a Price <ArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-6 py-3 font-semibold text-paper transition-colors hover:bg-paper/10"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Driver / Tourist exchange — the problem, visualized */}
            <div className="space-y-4">
              <div className="relative rounded-card border border-paper/10 bg-ink-soft p-6 shadow-card">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/10 text-sm font-bold">D</div>
                    <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-paper/10 px-4 py-3">
                      <p className="font-meter text-2xl font-bold tabular-nums text-signal">₹900</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end gap-3">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-signal px-4 py-3 text-ink">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <MessageCircleQuestion size={16} /> Is that a fair price?
                      </p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal text-sm font-bold text-ink">T</div>
                  </div>
                </div>
                <p className="mt-6 border-t border-paper/10 pt-4 text-sm text-paper/60">
                  Travelers often lack local price knowledge when dealing with
                  unfamiliar transportation services. FairTrip closes that gap.
                </p>
              </div>

              {/* Live, working demo — real API calls, not a mockup */}
              <LiveDemoWidget />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-paper">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Enter',
              desc: 'Tell us the city, service, distance, time, and the price you were quoted.',
              icon: MessageCircleQuestion,
            },
            {
              title: 'Analyze',
              desc: 'Our Random Forest model estimates a typical price range from comparable trip data.',
              icon: ScanLine,
            },
            {
              title: 'Decide',
              desc: 'See exactly where your quote lands, with plain-language reasons why — then decide for yourself.',
              icon: ShieldCheck,
            },
          ].map((step) => (
            <div key={step.title} className="rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
              <step.icon className="text-signal" size={28} strokeWidth={2} />
              <h3 className="mt-4 font-display text-lg font-bold text-paper">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-y border-ink-line bg-ink-soft">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper md:text-3xl">
            FairTrip doesn't tell you what to pay.
            <br />
            It gives you information to decide.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate">
            We are not a booking platform, not a fraud detector, and we don't claim
            to know the legally correct price. Every estimate comes with its
            uncertainty shown, not hidden.
          </p>
        </div>
      </section>

      {/* EXPLAINABILITY SHOWCASE (green & black) */}
      <section className="overflow-hidden bg-black text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-green-400">Explainability</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              See exactly which
              <br />
              factors moved your price.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Every estimate is built from real trip factors — city, distance,
              time of day, service and vehicle type. FairTrip highlights the
              ones that contributed most, so the number on screen never feels
              like a black box.
            </p>
            <Link
              to="/checker"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-green-400"
            >
              See it on your trip <ArrowRight size={18} />
            </Link>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <ExplainabilityShowcase />
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={ScanLine}
            title="Scan & Check"
            desc="Photograph a rate card or quotation and let OCR pull out the numbers for you to verify."
            to="/scan"
          />
          <FeatureCard
            icon={Users}
            title="Community Reports"
            desc="Share what you actually paid. Validated reports improve future estimates for everyone."
            to="/community"
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Model Transparency"
            desc="See real evaluation metrics and how every estimate and range is calculated — no black box."
            to="/model"
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group rounded-card border border-ink-line bg-ink-soft p-6 shadow-card transition-transform hover:-translate-y-1"
    >
      <Icon className="text-signal" size={24} />
      <h3 className="mt-4 font-display text-base font-bold text-paper">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-signal opacity-0 transition-opacity group-hover:opacity-100">
        Explore <ArrowRight size={14} />
      </span>
    </Link>
  )
}
