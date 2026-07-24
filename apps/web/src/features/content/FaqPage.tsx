import { Reveal } from '@/shared/ui/Reveal'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">FAQ</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Quick answers
        </h1>
        <div className="mt-8 space-y-6 text-ink-secondary">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Where is your shop?</h2>
            <p className="mt-2">
              Shop # 5, Block # 1, Near Ali Computer College, Karim Park, Lahore. Call 0307 8600067
              or 0300 0065558, or message us on WhatsApp.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">How do I buy?</h2>
            <p className="mt-2">
              See products on the shop page, then contact us. We check stock and help you finish
              the order. There is no online payment on this website.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">What currency do you use?</h2>
            <p className="mt-2">Prices are in PKR (Pakistani Rupees).</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Why do some products say “Contact for price”?
            </h2>
            <p className="mt-2">
              For some items we give the price when you ask — WhatsApp or call us and we will tell
              you.
            </p>
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
