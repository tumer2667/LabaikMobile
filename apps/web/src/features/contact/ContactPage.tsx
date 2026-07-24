import { useLocation } from 'react-router-dom'

import { Reveal } from '@/shared/ui/Reveal'
import { Card } from '@/shared/ui/Card'
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Contact
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
            Ready to order?
          </h1>
          <p className="mt-4 leading-relaxed text-ink-secondary">
            There is no online checkout. Message us with the products you want — we confirm
            availability and complete the order offline. All prices are in {appConfig.currency}.
          </p>
          {interest ? (
            <div className="mt-6 rounded-xl border border-brand-blue/30 bg-brand-blue-soft px-4 py-3 text-sm text-ink">
              Interested in: <span className="font-semibold">{interest}</span>
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Email
              </p>
              <a
                href={`mailto:hello@labaikmobiles.com?subject=${encodeURIComponent(
                  interest ? `Order enquiry: ${interest}` : 'Order enquiry',
                )}`}
                className="mt-1 inline-block text-lg font-medium text-brand-blue hover:text-brand-blue-hover"
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
            <div className="border-t border-border pt-4">
              <p className="text-sm text-ink-muted">
                Contact form API arrives with CMS. For now, email is the fastest path.
              </p>
              <a
                href={`mailto:hello@labaikmobiles.com?subject=${encodeURIComponent(
                  interest ? `Order enquiry: ${interest}` : 'Order enquiry',
                )}`}
                className="mt-4 inline-block"
              >
                <Button>Open email</Button>
              </a>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
