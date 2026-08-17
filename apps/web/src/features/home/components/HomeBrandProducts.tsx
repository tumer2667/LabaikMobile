import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import type { Brand, Product } from '@/entities/catalog/types'
import { fetchProducts } from '@/features/catalog/api'
import {
  ProductPrice,
  productDiscountPercent,
} from '@/features/catalog/components/ProductPrice'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'

type HomeBrandProductsProps = {
  brands: Brand[]
  brandsLoading: boolean
}

const MAX_PRODUCTS = 8

export function HomeBrandProducts({ brands, brandsLoading }: HomeBrandProductsProps) {
  const activeBrands = brands.filter((b) => b.is_active)
  const [selected, setSelected] = useState<string>('all')

  useEffect(() => {
    if (selected === 'all') return
    if (!activeBrands.some((b) => b.slug === selected)) {
      setSelected('all')
    }
  }, [activeBrands, selected])

  const productsQuery = useQuery({
    queryKey: ['products', 'home-brand', selected],
    queryFn: () =>
      fetchProducts({
        brand: selected === 'all' ? undefined : selected,
        sort: 'featured',
        page_size: MAX_PRODUCTS,
      }),
  })

  const products = (productsQuery.data?.items ?? []).slice(0, MAX_PRODUCTS)
  const selectedLabel =
    selected === 'all'
      ? 'All brands'
      : (activeBrands.find((b) => b.slug === selected)?.name ?? 'Brand')

  if (!brandsLoading && activeBrands.length === 0) {
    return null
  }

  return (
    <section className="border-y border-border/60 bg-surface-elevated/70 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                Brands
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Shop by brand
              </h2>
              <p className="mt-2 max-w-md text-ink-secondary">
                Tap a brand to preview up to {MAX_PRODUCTS} products here.
              </p>
            </div>
            <Link
              to={selected === 'all' ? '/shop' : `/shop?brand=${encodeURIComponent(selected)}`}
              className="hidden sm:block"
            >
              <Button variant="secondary" size="sm">
                See all {selected === 'all' ? 'products' : selectedLabel}
              </Button>
            </Link>
          </div>
        </Reveal>

        <div className="mb-7 -mx-4 overflow-x-auto px-4 sm:-mx-0 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-2 sm:flex-wrap sm:justify-start">
            {brandsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
              ))
            ) : (
              <>
                <BrandTab
                  label="All"
                  active={selected === 'all'}
                  onClick={() => setSelected('all')}
                />
                {activeBrands.map((brand) => (
                  <BrandTab
                    key={brand.id}
                    label={brand.name}
                    active={selected === brand.slug}
                    onClick={() => setSelected(brand.slug)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <p className="mb-4 text-sm text-ink-muted">
          Showing <span className="font-semibold text-ink">{selectedLabel}</span>
          {!productsQuery.isLoading ? (
            <>
              {' '}
              · {products.length}
              {products.length >= MAX_PRODUCTS ? ` of many` : ''} product
              {products.length === 1 ? '' : 's'}
            </>
          ) : null}
        </p>

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4">
            {Array.from({ length: MAX_PRODUCTS }).map((_, i) => (
              <Skeleton key={i} className="h-[13.5rem] rounded-xl sm:h-[14.5rem]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              No products for this brand yet
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              Try another brand, or browse the full shop.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setSelected('all')}>
                Show all brands
              </Button>
              <Link to="/shop">
                <Button size="sm">Go to shop</Button>
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4"
            >
              {products.map((product) => (
                <BrandProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mt-7 text-center sm:hidden">
          <Link
            to={selected === 'all' ? '/shop' : `/shop?brand=${encodeURIComponent(selected)}`}
            className="text-sm font-semibold text-brand-blue"
          >
            See all {selected === 'all' ? 'products' : selectedLabel} →
          </Link>
        </div>
      </div>
    </section>
  )
}

function BrandProductCard({ product }: { product: Product }) {
  const discount = productDiscountPercent(product)
  const image = product.primary_image ?? product.images[0] ?? ''
  const productPath = `/shop/${product.slug}`

  return (
    <Link
      to={productPath}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-surface-elevated shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-brand-blue/35 hover:shadow-lift"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-brand-blue-soft/35">
        <ProductImage
          src={image}
          alt={product.name}
          className="h-full w-full"
          imgClassName="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent opacity-80" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.is_new ? (
            <span className="rounded-md bg-ink/85 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
          ) : null}
          {discount != null ? (
            <span className="rounded-md bg-brand-green px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{discount}%
            </span>
          ) : null}
          {!product.in_stock ? (
            <span className="rounded-md bg-ink-secondary/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Sold out
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-blue">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[0.8125rem] font-semibold leading-snug tracking-tight text-ink transition group-hover:text-brand-blue-deep sm:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <ProductPrice product={product} size="sm" />
          <span className="shrink-0 text-[11px] font-semibold text-brand-blue opacity-80 transition group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

function BrandTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition',
        active
          ? 'bg-brand-gradient text-white shadow-glow-blue'
          : 'border border-border bg-surface-elevated text-ink shadow-soft hover:border-brand-blue/40 hover:text-brand-blue',
      )}
    >
      {label}
    </button>
  )
}
