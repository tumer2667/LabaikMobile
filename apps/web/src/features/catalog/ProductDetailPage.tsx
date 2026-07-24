import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { fetchProduct, fetchProducts } from '@/features/catalog/api'
import { OrderWhatsAppPanel } from '@/features/catalog/components/OrderWhatsAppPanel'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { ProductPrice } from '@/features/catalog/components/ProductPrice'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Button } from '@/shared/ui/Button'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const productQuery = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    enabled: Boolean(slug),
  })
  const product = productQuery.data
  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState<string>('')

  const relatedQuery = useQuery({
    queryKey: ['products', 'related', product?.category_slug],
    queryFn: () =>
      fetchProducts({ category: product!.category_slug, page_size: 8 }),
    enabled: Boolean(product?.category_slug),
  })

  const related = useMemo(
    () => (relatedQuery.data?.items ?? []).filter((p) => p.slug !== slug).slice(0, 4),
    [relatedQuery.data, slug],
  )

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Product not found</h1>
        <Link to="/shop" className="mt-8 inline-block">
          <Button>Back to shop</Button>
        </Link>
      </div>
    )
  }

  const selectedColor = color || product.colors[0] || ''
  const image = product.images[activeImage] ?? product.images[0] ?? ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="text-sm text-ink-muted">
        <Link to="/shop" className="hover:text-brand-blue">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/shop?category=${product.category_slug}`}
          className="capitalize hover:text-brand-blue"
        >
          {product.category_name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface-elevated shadow-lift">
              <AnimatePresence mode="wait">
                <motion.div
                  key={image}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductImage src={image} alt={product.name} priority className="aspect-square" />
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
              <p className="mt-3 text-ink-secondary">{product.short_description}</p>
              <p className="mt-3 text-sm text-ink-muted">
                ★ {product.rating.toFixed(1)} · {product.review_count} reviews
              </p>
            </div>

            <div className="space-y-2">
              <ProductPrice product={product} size="lg" />
              {!product.show_price && (
                <p className="text-sm text-ink-muted">
                  Price is not shown here — message us and we will tell you.
                </p>
              )}
            </div>

            <p
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                product.in_stock
                  ? 'bg-brand-green-soft text-brand-green-hover'
                  : 'bg-border text-ink-muted',
              )}
            >
              {product.in_stock ? 'In stock' : 'Not available now'}
            </p>

            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-ink">Color: {selectedColor}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition',
                        selectedColor === c
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

            <OrderWhatsAppPanel
              inStock={product.in_stock}
              order={{
                productName: product.name,
                brand: product.brand,
                category: product.category_name,
                color: selectedColor || undefined,
                pricePkr: product.price_pkr,
                showPrice: product.show_price,
                askForPrice: !product.show_price,
                productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
              }}
            />

            <div className="pt-1">
              <Link to="/shop">
                <Button size="md" variant="ghost">
                  ← Back to shop
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-ink">More products</h2>
          <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
