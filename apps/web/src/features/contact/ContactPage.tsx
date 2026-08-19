import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { businessInfo, mapsOpenUrl, whatsappUrl } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { orderWhatsAppHref } from '@/shared/lib/orderWhatsApp'
import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { StoreMap } from '@/shared/ui/StoreMap'

type ContactState = {
  productName?: string
  color?: string
  brand?: string
  category?: string
  pricePkr?: number
  showPrice?: boolean
}

export function ContactPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as ContactState
  const hasProduct = Boolean(state.productName)
  const interest =
    state.productName != null
      ? `${state.productName}${state.color ? ` · ${state.color}` : ''}`
      : ''

  const mailHref = `mailto:${businessInfo.email}?subject=${encodeURIComponent(
    interest ? `Order: ${interest}` : 'Order enquiry',
  )}`
  const primary = businessInfo.phones[0]
  const whatsappHref = hasProduct
    ? orderWhatsAppHref({
        productName: state.productName!,
        brand: state.brand,
        category: state.category,
        color: state.color,
        pricePkr: state.pricePkr,
        showPrice: state.showPrice,
        askForPrice: state.showPrice === false,
      })
    : whatsappUrl(primary.whatsapp, 'Hi, I want to place an order.')

  const channels = [
    {
      label: 'WhatsApp',
      detail: primary.display,
      hint: 'Fastest way to ask about stock',
      href: whatsappHref,
      external: true,
      tone: 'green' as const,
    },
    {
      label: 'Call',
      detail: primary.display,
      hint: 'Call this number',
      href: `tel:${primary.tel}`,
      external: false,
      tone: 'blue' as const,
    },
    {
      label: 'Email',
      detail: businessInfo.email,
      hint: 'For longer messages',
      href: mailHref,
      external: false,
      tone: 'blue' as const,
    },
    {
      label: 'Visit shop',
      detail: 'Karim Park, Lahore',
      hint: businessInfo.addressLines[0],
      href: mapsOpenUrl(),
      external: true,
      tone: 'green' as const,
    },
  ]

  return (
    <div>
      {/* Compact action hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-blue/15 via-brand-green/8 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Contact
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  {hasProduct ? (
                    <>
                      Order on <span className="text-brand-gradient">WhatsApp</span>
                    </>
                  ) : (
                    <>
                      Need something? <span className="text-brand-gradient">Message us.</span>
                    </>
                  )}
                </h1>
                <p className="mt-4 text-ink-secondary">
                  {hasProduct
                    ? 'Tap WhatsApp below. Your product details are already written in the message — just send it to us.'
                    : `Choose WhatsApp, call, email, or visit the shop. We check stock and help you order in ${appConfig.currency}. No online payment here.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <Button variant="gradient" size="lg">
                    {hasProduct ? 'Send order on WhatsApp' : 'WhatsApp now'}
                  </Button>
                </a>
                <a href={`tel:${primary.tel}`}>
                  <Button variant="secondary" size="lg">
                    Call {primary.display}
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>

          {interest ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-brand-green/35 bg-brand-green-soft/90 px-4 py-3 text-sm text-ink"
            >
              Looking at: <span className="font-semibold">{interest}</span>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Channel cards — unique to contact */}
      <section className="pb-12 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel, index) => (
              <Reveal key={channel.label} delay={index * 0.05}>
                <a
                  href={channel.href}
                  target={channel.external ? '_blank' : undefined}
                  rel={channel.external ? 'noreferrer' : undefined}
                  className="group flex h-full flex-col rounded-3xl border border-border/80 bg-surface-elevated/90 p-6 shadow-soft backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand-blue/35 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={
                        channel.tone === 'green'
                          ? 'rounded-full bg-brand-green-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-green-hover'
                          : 'rounded-full bg-brand-blue-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-blue-deep'
                      }
                    >
                      {channel.label}
                    </span>
                    <span className="text-sm font-semibold text-ink-muted transition group-hover:text-brand-blue">
                      →
                    </span>
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold tracking-tight text-ink break-all">
                    {channel.detail}
                  </p>
                  <p className="mt-2 text-sm text-ink-muted">{channel.hint}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Map-forward block */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Location
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  Our shop location
                </h2>
                <p className="mt-1 max-w-lg text-sm text-ink-secondary">{businessInfo.address}</p>
              </div>
              <a
                href={mapsOpenUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand-blue hover:text-brand-blue-hover"
              >
                Open in Google Maps →
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <StoreMap className="rounded-[1.75rem] shadow-lift [&_iframe]:h-72 sm:[&_iframe]:h-96" />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
