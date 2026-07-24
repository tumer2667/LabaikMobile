import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { businessInfo } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { fadeUp, staggerContainer } from '@/shared/lib/motion'
import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { StoreMap } from '@/shared/ui/StoreMap'

const values = [
  {
    title: 'Curated, not cluttered',
    copy: 'Phones, earbuds, cases, and power accessories chosen for everyday reliability — not endless SKU noise.',
    accent: 'from-brand-blue/20 to-brand-blue/5',
  },
  {
    title: 'Clear PKR pricing',
    copy: 'Where a category shows prices, you see them in PKR. Where it doesn’t, we quote you personally.',
    accent: 'from-brand-green/20 to-brand-green/5',
  },
  {
    title: 'Human ordering',
    copy: 'No cart checkout. Tell us what you need — we confirm stock and arrange payment offline.',
    accent: 'from-brand-blue/15 to-brand-green/10',
  },
] as const

const journey = [
  { step: '01', title: 'Browse', copy: 'Explore phones and accessories in the shop.' },
  { step: '02', title: 'Reach out', copy: 'WhatsApp, call, or visit us in Karim Park.' },
  { step: '03', title: 'Confirm', copy: 'We verify stock and finalize your order with you.' },
] as const

export function AboutPage() {
  return (
    <div>
      {/* Editorial hero — story, not contact duplicate */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-brand-gradient opacity-[0.08]" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue"
            >
              Our story
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.05]"
            >
              Mobile gear from a shop you can{' '}
              <span className="text-brand-gradient">actually talk to.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary"
            >
              {appConfig.name} is a Lahore storefront for phones and accessories — built for people
              who want clear options, honest guidance, and a simple way to order without fighting a
              checkout flow.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="gradient" size="lg">
                  Browse the catalog
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  How to reach us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
              What we stand for
            </p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Premium feel. Local trust.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <div
                  className={`h-full rounded-3xl border border-border/70 bg-gradient-to-br ${item.accent} p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift`}
                >
                  <span className="inline-block h-1.5 w-10 rounded-full bg-brand-gradient" />
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Journey strip */}
      <section className="border-y border-border/70 bg-surface-elevated/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Three steps. No cart drama.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {journey.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08}>
                <div className="relative">
                  <p className="font-display text-5xl font-semibold text-brand-blue/15">{item.step}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit teaser — map secondary, story primary */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-ink text-white shadow-lift">
            <div className="grid lg:grid-cols-2">
              <div className="relative space-y-6 p-8 sm:p-10 lg:p-12">
                <div className="absolute inset-0 bg-brand-gradient opacity-25" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Visit the shop
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Find us in Karim Park
                  </h2>
                  <p className="mt-4 max-w-md text-white/70">
                    Drop by for hands-on advice, or message us first so we can check stock for you.
                  </p>
                  <div className="mt-6 space-y-1 text-sm text-white/80">
                    {businessInfo.addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Link to="/contact">
                      <Button variant="gradient">Get directions & contact</Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="min-h-[280px] border-t border-white/10 lg:border-l lg:border-t-0">
                <StoreMap
                  hideCaption
                  className="h-full rounded-none border-0 shadow-none [&_iframe]:h-full [&_iframe]:min-h-[280px] sm:[&_iframe]:min-h-[340px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
