import { Reveal } from '@/shared/ui/Reveal'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">FAQ</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Common questions
        </h1>
        <div className="mt-8 space-y-6 text-ink-secondary">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Where are you located?</h2>
            <p className="mt-2">
              Shop # 5, Block # 1, Near Ali Computer College, Karim Park, Lahore. Call 0307 8600067
              or 0300 0065558, or message us on WhatsApp.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">How do I buy?</h2>
            <p className="mt-2">
              Browse products, then use Contact. We confirm stock and arrange payment offline.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">What currency?</h2>
            <p className="mt-2">All prices are shown in PKR.</p>
          </div>
        </div>
        <div className="mt-10">
          <Link to="/contact">
            <Button>Contact us</Button>
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
