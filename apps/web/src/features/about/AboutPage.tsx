import { Reveal } from '@/shared/ui/Reveal'
import { appConfig } from '@/shared/config/env'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">About</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          {appConfig.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
          We sell mobile phones and accessories with a focus on quality, clarity, and a premium
          buying experience. Browse the shop, then contact us to complete your order.
        </p>
      </Reveal>
    </div>
  )
}
