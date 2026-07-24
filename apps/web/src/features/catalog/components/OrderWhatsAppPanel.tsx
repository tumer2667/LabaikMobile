import { businessInfo } from '@/shared/config/business'
import { orderWhatsAppHref, type OrderMessageInput } from '@/shared/lib/orderWhatsApp'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

type OrderWhatsAppPanelProps = {
  order: OrderMessageInput
  inStock: boolean
  className?: string
}

export function OrderWhatsAppPanel({ order, inStock, className }: OrderWhatsAppPanelProps) {
  const primary = businessInfo.phones[0]
  const secondary = businessInfo.phones[1]
  const whatsappHref = orderWhatsAppHref(order)
  const askPrice = order.askForPrice || order.showPrice === false

  return (
    <div
      className={cn(
        'rounded-3xl border border-brand-green/30 bg-gradient-to-br from-brand-green-soft/80 via-surface-elevated to-brand-blue-soft/50 p-5 shadow-soft sm:p-6',
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-hover">
        How to order
      </p>
      <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {askPrice ? 'Ask price on WhatsApp' : 'Order on WhatsApp'}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Tap the button. WhatsApp opens with your product details ready. Send the message — we will
        reply and confirm.
      </p>

      <ol className="mt-4 space-y-1.5 text-sm text-ink-secondary">
        <li>
          <span className="font-semibold text-ink">1.</span> Choose color (if needed)
        </li>
        <li>
          <span className="font-semibold text-ink">2.</span> Tap WhatsApp order
        </li>
        <li>
          <span className="font-semibold text-ink">3.</span> Send the message to us
        </li>
      </ol>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={inStock ? whatsappHref : undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!inStock}
          className={cn(!inStock && 'pointer-events-none')}
          onClick={(e) => {
            if (!inStock) e.preventDefault()
          }}
        >
          <Button size="lg" variant="gradient" disabled={!inStock}>
            {askPrice ? 'WhatsApp — ask price' : 'WhatsApp — order now'}
          </Button>
        </a>
        <a href={`tel:${primary.tel}`}>
          <Button size="lg" variant="secondary" disabled={!inStock}>
            Call {primary.display}
          </Button>
        </a>
      </div>

      {!inStock ? (
        <p className="mt-3 text-sm font-medium text-ink-muted">
          This item is not available right now. Message us for similar options.
        </p>
      ) : (
        <p className="mt-3 text-xs text-ink-muted">
          Message goes to {primary.display}
          {secondary ? ` (or ${secondary.display})` : ''}. Product name, color, and price are
          included automatically.
        </p>
      )}
    </div>
  )
}
