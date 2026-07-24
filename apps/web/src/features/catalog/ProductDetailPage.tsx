import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { demoProducts, getProductBySlug, productShowsPrice } from '@/entities/catalog/demo-data'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { ProductPrice } from '@/features/catalog/components/ProductPrice'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Button } from '@/shared/ui/Button'
import { Reveal } from '@/shared/ui/Reveal'
import { cn } from '@/shared/lib/cn'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState(product?.colors[0] ?? '')

  const related = useMemo(() => {
    if (!product) return []
    return demoProducts
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, 4)
  }, [product])

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Product not found</h1>
        <p className="mt-2 text-ink-muted">This demo item may have been removed.</p>
        <Link to="/shop" className="mt-8 inline-block">
          <Button>Back to shop</Button>
        </Link>
      </div>
    )
  }

  const image = product.images[activeImage] ?? product.images[0] ?? ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="text-sm text-ink-muted">
        <Link to="/shop" className="hover:text-brand-blue">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/shop?category=${product.categorySlug}`}
          className="capitalize hover:text-brand-blue"
        >
          {product.categorySlug.replace(/-/g, ' ')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft">
              <AnimatePresence mode="wait">
                <motion.div
                  key={image}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductImage
                    src={image}
                    alt={product.name}
                    priority
                    className="aspect-square"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
                    index === activeImage
                      ? 'border-brand-blue'
                      : 'border-transparent opacity-80 hover:opacity-100',
                  )}
                >
                  <ProductImage src={src} alt="" className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-ink-muted">
                {product.brand}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-3 text-ink-secondary">{product.shortDescription}</p>
              <p className="mt-3 text-sm text-ink-muted">
                ★ {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </p>
            </div>

            <div className="space-y-2">
              <ProductPrice product={product} size="lg" />
              {!productShowsPrice(product) && (
                <p className="text-sm text-ink-muted">
                  Pricing for this category is hidden — contact us for a quote.
                </p>
              )}
            </div>

            <p
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                product.inStock
                  ? 'bg-brand-green-soft text-brand-green-hover'
                  : 'bg-border text-ink-muted',
              )}
            >
              {product.inStock ? 'In stock' : 'Currently unavailable'}
            </p>

            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-ink">Color: {color}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition',
                        color === c
                          ? 'bg-brand-blue-soft text-brand-blue ring-brand-blue'
                          : 'bg-surface-elevated text-ink-secondary ring-border hover:ring-border-strong',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ul className="grid gap-2 sm:grid-cols-2">
              {product.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border bg-surface-elevated/80 px-3.5 py-2.5 text-sm text-ink-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>

            <p className="leading-relaxed text-ink-secondary">{product.description}</p>

            <div className="flex flex-wrap gap-3 border-t border-border pt-6">
              <Link
                to="/contact"
                state={{ productName: product.name, color }}
              >
                <Button size="lg" disabled={!product.inStock}>
                  {productShowsPrice(product) ? 'Contact to order' : 'Request a quote'}
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="secondary">
                  Continue shopping
                </Button>
              </Link>
            </div>
            <p className="text-xs text-ink-muted">
              No online checkout — we confirm availability and complete orders via contact.
              Product photos are demo placeholders until Admin uploads go live.
            </p>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-ink">You may also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
