import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import {
  demoBrands,
  demoCategories,
  demoProducts,
  getCategoryBySlug,
  type DemoProduct,
} from '@/entities/catalog/demo-data'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { Button } from '@/shared/ui/Button'
import { Reveal } from '@/shared/ui/Reveal'
import { cn } from '@/shared/lib/cn'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating'

function sortProducts(products: DemoProduct[], sort: SortKey): DemoProduct[] {
  const next = [...products]
  switch (sort) {
    case 'price-asc':
      return next.sort((a, b) => a.pricePkr - b.pricePkr)
    case 'price-desc':
      return next.sort((a, b) => b.pricePkr - a.pricePkr)
    case 'rating':
      return next.sort((a, b) => b.rating - a.rating)
    default:
      return next.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
  }
}

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'all'
  const [brand, setBrand] = useState<string>('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('featured')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = demoProducts
    if (category !== 'all') list = list.filter((p) => p.categorySlug === category)
    if (brand !== 'all') list = list.filter((p) => p.brand === brand)
    if (inStockOnly) list = list.filter((p) => p.inStock)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      )
    }
    return sortProducts(list, sort)
  }, [category, brand, inStockOnly, sort, query])

  const activeCategory = category !== 'all' ? getCategoryBySlug(category) : undefined
  const categoryHidesPrice = activeCategory != null && !activeCategory.showPrice

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params)
    if (slug === 'all') next.delete('category')
    else next.set('category', slug)
    setParams(next, { replace: true })
    // Price sort is meaningless when the category hides prices
    if (slug !== 'all') {
      const cat = getCategoryBySlug(slug)
      if (cat && !cat.showPrice && (sort === 'price-asc' || sort === 'price-desc')) {
        setSort('featured')
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              Shop
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
              Mobile essentials
            </h1>
            <p className="mt-2 max-w-xl text-ink-secondary">
              Demo catalog with placeholder imagery. Final photos will be managed in Admin and
              stored on Supabase. Contact us to order — prices in PKR.
            </p>
          </div>
          <Link to="/contact">
            <Button>Contact to order</Button>
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Search
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:shadow-focus"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Category
            </p>
            <div className="mt-2 flex flex-wrap gap-2 lg:flex-col">
              <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
                All
              </FilterChip>
              {demoCategories.map((c) => (
                <FilterChip
                  key={c.id}
                  active={category === c.slug}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Brand</p>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue focus:shadow-focus"
            >
              <option value="all">All brands</option>
              {demoBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="size-4 rounded border-border accent-brand-blue"
            />
            In stock only
          </label>
        </aside>

        <div>
          {categoryHidesPrice && (
            <div className="mb-6 rounded-xl border border-brand-blue/25 bg-brand-blue-soft px-4 py-3 text-sm text-ink">
              <span className="font-semibold">{activeCategory.name}</span> has storefront prices
              turned off (admin category setting). Customers see “Contact for price” instead.
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {filtered.length} product{filtered.length === 1 ? '' : 's'}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-border bg-surface-elevated px-3.5 py-2 text-sm outline-none focus:border-brand-blue"
            >
              <option value="featured">Featured</option>
              {!categoryHidesPrice && (
                <>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </>
              )}
              <option value="rating">Top rated</option>
            </select>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-dashed border-border-strong bg-surface-elevated/60 px-6 py-16 text-center"
              >
                <p className="font-display text-lg font-semibold text-ink">No matches</p>
                <p className="mt-2 text-sm text-ink-muted">Try clearing filters or search.</p>
                <Button
                  className="mt-6"
                  variant="secondary"
                  onClick={() => {
                    setCategory('all')
                    setBrand('all')
                    setInStockOnly(false)
                    setQuery('')
                  }}
                >
                  Reset filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-left text-sm font-medium transition',
        active
          ? 'bg-brand-blue text-white shadow-soft'
          : 'bg-surface-elevated text-ink-secondary ring-1 ring-border hover:bg-brand-blue-soft hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
