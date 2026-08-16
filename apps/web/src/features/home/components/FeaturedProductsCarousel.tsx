import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import type { Product } from '@/entities/catalog/types'
import { ProductPrice } from '@/features/catalog/components/ProductPrice'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'

type FeaturedProductsCarouselProps = {
  products: Product[]
  isLoading: boolean
}

/** px per second */
const AUTO_SPEED = 36

export function FeaturedProductsCarousel({
  products,
  isLoading,
}: FeaturedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  // Repeat enough times that the track always overflows and can loop.
  // Keep an even copy count so the first half mirrors the second half.
  const slides = useMemo(() => {
    if (products.length === 0) return []
    let copies = Math.max(4, Math.ceil(10 / products.length))
    if (copies % 2 !== 0) copies += 1
    return Array.from({ length: copies }, () => products).flat()
  }, [products])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    if (isLoading || products.length === 0) return
    const track = trackRef.current
    if (!track) return

    let raf = 0
    let last = performance.now()
    offsetRef.current = 0
    track.style.transform = 'translate3d(0,0,0)'

    const tick = (now: number) => {
      const dt = Math.min(32, now - last)
      last = now

      if (!pausedRef.current) {
        // Half of the duplicated track = one full set of copies/2 when even;
        // use measured half of scrollWidth for seamless loop.
        const half = track.scrollWidth / 2
        if (half > 0) {
          offsetRef.current += (AUTO_SPEED * dt) / 1000
          if (offsetRef.current >= half) {
            offsetRef.current -= half
          }
          track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isLoading, products])

  const nudge = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const half = track.scrollWidth / 2 || 1
    offsetRef.current = (offsetRef.current + direction * 220 + half * 10) % half
    track.style.transform = `translate3d(${-offsetRef.current}px,0,0)`
  }

  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-elevated/80 py-9 sm:py-11">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">
                Featured
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Featured products
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-1.5 sm:flex">
                <CarouselArrow
                  label="Previous products"
                  onClick={() => nudge(-1)}
                  direction="prev"
                />
                <CarouselArrow
                  label="Next products"
                  onClick={() => nudge(1)}
                  direction="next"
                />
              </div>
              <Link to="/shop" className="hidden sm:block">
                <Button variant="secondary" size="sm">
                  See all
                </Button>
              </Link>
              <Link to="/shop" className="text-sm font-semibold text-brand-blue sm:hidden">
                See all →
              </Link>
            </div>
          </div>
        </Reveal>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false)
            }
          }}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setPaused(false), 2000)}
        >
          {isLoading ? (
            <div className="flex gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[9.5rem] w-[min(78vw,17.5rem)] shrink-0 rounded-2xl sm:w-[16rem]"
                />
              ))}
            </div>
          ) : (
            <div
              ref={trackRef}
              className="flex w-max gap-3.5 will-change-transform"
              style={{ transform: 'translate3d(0,0,0)' }}
            >
              {slides.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[min(78vw,17.5rem)] shrink-0 sm:w-[16rem]"
                >
                  <CompactProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CompactProductCard({ product }: { product: Product }) {
  const image = product.primary_image ?? product.images[0] ?? ''
  const productPath = `/shop/${product.slug}`

  return (
    <Link
      to={productPath}
      className="group flex h-[9.5rem] items-stretch gap-3 overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated p-2.5 shadow-soft transition hover:border-brand-blue/35 hover:shadow-lift"
    >
      <div className="relative w-[7.25rem] shrink-0 overflow-hidden rounded-xl bg-brand-blue-soft/40 sm:w-[8rem]">
        <ProductImage
          src={image}
          alt={product.name}
          className="h-full w-full"
          imgClassName="transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-blue">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-[0.95rem] font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-blue-deep">
          {product.name}
        </h3>
        <div className="mt-2">
          <ProductPrice product={product} size="sm" />
        </div>
        <p className="mt-2 text-xs font-semibold text-brand-blue">View details →</p>
      </div>
    </Link>
  )
}

function CarouselArrow({
  label,
  onClick,
  direction,
}: {
  label: string
  onClick: () => void
  direction: 'prev' | 'next'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-ink shadow-soft transition',
        'hover:border-brand-blue/40 hover:text-brand-blue',
      )}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-3.5 w-3.5">
        {direction === 'prev' ? (
          <path
            d="M12.5 4.5 7 10l5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M7.5 4.5 13 10l-5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}
