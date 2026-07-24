import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { appConfig } from '@/shared/config/env'

type ContactState = {
  productName?: string
  color?: string
}

export function ContactPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as ContactState
  const interest =
    state.productName != null
      ? `${state.productName}${state.color ? ` · ${state.color}` : ''}`
      : ''

  const mailHref = `mailto:hello@labaikmobiles.com?subject=${encodeURIComponent(
    interest ? `Order enquiry: ${interest}` : 'Order enquiry',
  )}`

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-green/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              Contact
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Ready to{' '}
              <span className="text-brand-gradient">order?</span>
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-ink-secondary">
              There is no online checkout. Message us with the products you want — we confirm
              availability and complete the order offline. All prices are in {appConfig.currency}.
            </p>
            {interest ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-brand-blue/30 bg-brand-blue-soft/80 px-4 py-3 text-sm text-ink backdrop-blur-sm"
              >
                Interested in: <span className="font-semibold">{interest}</span>
              </motion.div>
            ) : null}
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass-panel space-y-6 rounded-3xl p-6 shadow-lift sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Email
                </p>
                <a
                  href={mailHref}
                  className="mt-1 inline-block text-lg font-semibold text-brand-blue transition hover:text-brand-blue-hover"
                >
                  hello@labaikmobiles.com
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  WhatsApp
                </p>
                <p className="mt-1 text-lg font-medium text-ink">Add your business number</p>
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-sm text-ink-muted">
                  Email is the fastest path while we build a contact form.
                </p>
                <a href={mailHref} className="mt-5 inline-block">
                  <Button variant="gradient" size="lg">
                    Open email
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
