import { Link } from 'react-router-dom'

import { businessInfo, whatsappUrl } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { StoreMap } from '@/shared/ui/StoreMap'

export function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-brand-green/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">About</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {appConfig.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
              We sell mobile phones and accessories with a focus on quality, clarity, and a premium
              buying experience. Visit our shop in Karim Park, or browse online and contact us to
              complete your order in {appConfig.currency}.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Address
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-ink">
                  {businessInfo.addressLines[0]}
                </p>
                <p className="text-ink-secondary">{businessInfo.addressLines[1]}</p>
                <p className="text-ink-secondary">{businessInfo.addressLines[2]}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Call / WhatsApp
                </p>
                <ul className="mt-2 space-y-2">
                  {businessInfo.phones.map((phone) => (
                    <li key={phone.tel} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <a
                        href={`tel:${phone.tel}`}
                        className="text-lg font-semibold text-brand-blue transition hover:text-brand-blue-hover"
                      >
                        {phone.display}
                      </a>
                      <a
                        href={whatsappUrl(phone.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-brand-green transition hover:text-brand-green-hover"
                      >
                        WhatsApp
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button variant="gradient">Explore shop</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary">Contact us</Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <StoreMap />
          </Reveal>
        </div>
      </div>
    </div>
  )
}
