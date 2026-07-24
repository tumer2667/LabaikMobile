import { businessInfo, mapsEmbedUrl, mapsOpenUrl } from '@/shared/config/business'
import { cn } from '@/shared/lib/cn'

type StoreMapProps = {
  className?: string
  title?: string
}

export function StoreMap({ className, title = `${businessInfo.name} location` }: StoreMapProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border shadow-soft', className)}>
      <iframe
        title={title}
        src={mapsEmbedUrl()}
        className="h-64 w-full border-0 sm:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-elevated px-4 py-3">
        <p className="text-sm text-ink-secondary">{businessInfo.address}</p>
        <a
          href={mapsOpenUrl()}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sm font-semibold text-brand-blue transition hover:text-brand-blue-hover"
        >
          Open in Maps
        </a>
      </div>
    </div>
  )
}
