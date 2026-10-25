import { Link } from 'react-router-dom'
import { ArrowRight, ScanLine, Users, ShieldCheck, MessageCircleQuestion, MapPin } from 'lucide-react'
import LiveDemoWidget from '../components/LiveDemoWidget'
import ExplainabilityShowcase from '../components/ExplainabilityShowcase'
import StatsStrip from '../components/StatsStrip'
import Reveal from '../components/Reveal'
import { CITY_NAMES } from '../data/landmarks'

const CITIES = CITY_NAMES

export default function Landing() {
  return (
    <div>
      {/* HERO — the animated night-ride scene plays behind this */}
      <section className="relative overflow-hidden text-paper">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="fade-up font-meter text-xs font-semibold uppercase tracking-[0.2em] text-signal" style={{ '--d': '0ms' }}>
                AI-Powered Fair Price Intelligence
              </p>
              <h1
                className="fade-up mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
                style={{ '--d': '120ms' }}
              >
                Know the price.
                <br />
                Travel with <span className="text-shimmer">confidence.</span>
              </h1>
              <p className="fade-up mt-6 max-w-md text-base leading-relaxed text-paper/75" style={{ '--d': '260ms' }}>
                A local quotes you a price. FairTrip shows you the typical range for
                trips like yours — so you can decide with information, not guesswork.
              </p>
              <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ '--d': '400ms' }}>
                <Link
                  to="/checker"
                  className="pulse-glow inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  Check a Price <ArrowRight size={18} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-paper/25 bg-ink/30 px-6 py-3 font-semibold text-paper backdrop-blur transition-colors hover:bg-paper/10"
                >
                  How It Works
                </a>
              </div>
            </div>

            <div className="fade-up space-y-4" style={{ '--d': '300ms' }}>
              <div className="float-slow relative rounded-card border border-ink-line bg-ink-soft p-6 shadow-card">
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
                <p className="mt-6 border-t border-paper/10 pt-4 text-sm text-paper/65">
                  Travelers often lack local price knowledge when dealing with
                  unfamiliar transportation services. FairTrip closes that gap.
                </p>
              </div>
              <LiveDemoWidget />
            </div>
          </div>
        </div>
      </section>

      {/* CITY TICKER */}
      <div className="overflow-hidden border-y border-ink-line bg-ink/50 py-3 backdrop-blur-sm">
        <div className="marquee font-meter text-xs uppercase tracking-[0.25em] text-slate">
          {[...CITIES, ...CITIES].map((c, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-2">
              <MapPin size={12} className="text-signal" /> {c}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-10">
        <StatsStrip />
      </div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight text-paper">How it works</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Enter', desc: 'Tell us the city, service, distance, time, and the price you were quoted.', icon: MessageCircleQuestion },
            { title: 'Analyze', desc: 'Our Random Forest model estimates a typical price range from comparable trip data.', icon: ScanLine },
            { title: 'Decide', desc: 'See exactly where your quote lands, with plain-language reasons why — then decide for yourself.', icon: ShieldCheck },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 140}>
              <div className="h-full rounded-card border border-ink-line bg-ink-soft p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-signal/40">
                <div className="flex items-center justify-between">
                  <step.icon className="text-signal" size={28} strokeWidth={2} />
                  <span className="font-meter text-xs text-slate-light">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-paper">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="border-y border-ink-line bg-ink-soft">
        <Reveal>
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
        </Reveal>
      </section>

      {/* EXPLAINABILITY SHOWCASE */}
      <section className="overflow-hidden bg-black/55 text-white backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <Reveal className="order-2 md:order-1">
            <p className="font-meter text-xs font-semibold uppercase tracking-[0.2em] text-green-400">Explainability</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              See exactly which
              <br />
              factors moved your price.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              Every estimate is built from real trip factors — city, distance, time of day,
              service and vehicle type. FairTrip highlights the ones that contributed most,
              so the number on screen never feels like a black box.
            </p>
            <Link
              to="/checker"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-green-400"
            >
              See it on your trip <ArrowRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={150} className="order-1 flex justify-center md:order-2">
            <div className="float-slow w-full max-w-xl">
              <ExplainabilityShowcase />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal>
            <FeatureCard icon={ScanLine} title="Scan & Check" to="/scan"
              desc="Photograph a rate card or quotation and let OCR pull out the numbers for you to verify." />
          </Reveal>
          <Reveal delay={140}>
            <FeatureCard icon={Users} title="Community Reports" to="/community"
              desc="Share what you actually paid. Validated reports improve future estimates for everyone." />
          </Reveal>
          <Reveal delay={280}>
            <FeatureCard icon={ShieldCheck} title="Model Transparency" to="/model"
              desc="See real evaluation metrics and how every estimate and range is calculated — no black box." />
          </Reveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Reveal>
          <div className="rounded-card border border-signal/30 bg-ink-soft p-10 text-center shadow-card">
            <h2 className="font-display text-3xl font-bold tracking-tight text-paper">Got a quote in mind?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate">
              Check it against the typical range before you pay — then decide for yourself.
            </p>
            <Link
              to="/checker"
              className="pulse-glow mt-6 inline-flex items-center gap-2 rounded-full bg-signal px-7 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Check a Price <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group block h-full rounded-card border border-ink-line bg-ink-soft p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-signal/40"
    >
      <Icon className="text-signal transition-transform duration-300 group-hover:scale-110" size={24} />
      <h3 className="mt-4 font-display text-base font-bold text-paper">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-signal opacity-0 transition-opacity group-hover:opacity-100">
        Explore <ArrowRight size={14} />
      </span>
    </Link>
  )
}
