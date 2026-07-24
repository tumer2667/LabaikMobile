import { Link } from 'react-router-dom'

import { Reveal } from '@/shared/ui/Reveal'
import { Button } from '@/shared/ui/Button'
import { appConfig } from '@/shared/config/env'

export function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-brand-green/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-56 w-56 rounded-full bg-brand-blue/15 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">About</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {appConfig.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
            We sell mobile phones and accessories with a focus on quality, clarity, and a premium
            buying experience. Browse the shop, then contact us to complete your order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop">
              <Button variant="gradient">Explore shop</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Contact us</Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
