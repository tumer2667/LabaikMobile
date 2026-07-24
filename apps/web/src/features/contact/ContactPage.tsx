import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { businessInfo, whatsappUrl } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { StoreMap } from '@/shared/ui/StoreMap'

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

  const mailHref = `mailto:${businessInfo.email}?subject=${encodeURIComponent(
    interest ? `Order enquiry: ${interest}` : 'Order enquiry',
  )}`
  const primaryWhatsApp = businessInfo.phones[0]
  const whatsappHref = whatsappUrl(
    primaryWhatsApp.whatsapp,
    interest ? `Hi, I'm interested in: ${interest}` : 'Hi, I would like to place an order.',
  )

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
              Ready to <span className="text-brand-gradient">order?</span>
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-ink-secondary">
              There is no online checkout. Call, WhatsApp, or visit our shop — we confirm
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

            <div className="mt-8 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Visit us
                </p>
                <p className="mt-1 text-base font-medium text-ink">{businessInfo.address}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Phone / WhatsApp
                </p>
                <ul className="mt-2 space-y-2">
                  {businessInfo.phones.map((phone) => (
                    <li key={phone.tel}>
                      <a
                        href={`tel:${phone.tel}`}
                        className="text-lg font-semibold text-brand-blue transition hover:text-brand-blue-hover"
                      >
                        {phone.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Email
                </p>
                <a
                  href={mailHref}
                  className="mt-1 inline-block text-lg font-semibold text-brand-blue transition hover:text-brand-blue-hover"
                >
                  {businessInfo.email}
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button variant="gradient" size="lg">
                  WhatsApp us
                </Button>
              </a>
              <a href={`tel:${primaryWhatsApp.tel}`}>
                <Button variant="secondary" size="lg">
                  Call now
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass-panel space-y-5 rounded-3xl p-5 shadow-lift sm:p-6">
              <div>
                <p className="font-display text-lg font-semibold text-ink">Find the shop</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Shop # 5, Block # 1 — near Ali Computer College, Karim Park.
                </p>
              </div>
              <StoreMap className="border-0 shadow-none" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
