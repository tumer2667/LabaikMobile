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
    title: 'Good quality items',
    copy: 'We sell phones, earbuds, cases, and chargers that people use every day.',
    accent: 'from-brand-blue/20 to-brand-blue/5',
  },
  {
    title: 'Honest prices',
    copy: 'Prices are in PKR. If a price is not shown, message us and we will tell you.',
    accent: 'from-brand-green/20 to-brand-green/5',
  },
  {
    title: 'Order with us directly',
    copy: 'No online cart. Call or WhatsApp — we check stock and help you buy.',
    accent: 'from-brand-blue/15 to-brand-green/10',
  },
] as const

const journey = [
  { step: '01', title: 'See products', copy: 'Open the shop and look at phones and accessories.' },
  { step: '02', title: 'Message us', copy: 'WhatsApp, call, or visit our shop in Karim Park.' },
  { step: '03', title: 'Place order', copy: 'We check stock and help you finish your order.' },
] as const

export function AboutPage() {
  return (
    <div>
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
              About us
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.05]"
            >
              Your local mobile shop —{' '}
              <span className="text-brand-gradient">easy to talk to.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-secondary"
            >
              {appConfig.name} sells phones and accessories in Lahore. See products online, then
              call, WhatsApp, or visit us to order. Simple, clear, and helpful.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="gradient" size="lg">
                  See products
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Contact us
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
              Why choose us
            </p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Simple service. Local shop.
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

      <section className="border-y border-border/70 bg-surface-elevated/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              How to buy
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              Just 3 easy steps
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

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-ink text-white shadow-lift">
            <div className="grid lg:grid-cols-2">
              <div className="relative space-y-6 p-8 sm:p-10 lg:p-12">
                <div className="absolute inset-0 bg-brand-gradient opacity-25" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                    Our shop
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Come visit us in Karim Park
                  </h2>
                  <p className="mt-4 max-w-md text-white/70">
                    Visit the shop, or message us first so we can check if the item is available.
                  </p>
                  <div className="mt-6 space-y-1 text-sm text-white/80">
                    {businessInfo.addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Link to="/contact">
                      <Button variant="gradient">Location & contact</Button>
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
