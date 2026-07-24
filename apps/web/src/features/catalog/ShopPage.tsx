import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { fetchBrands, fetchCategories, fetchProducts } from '@/features/catalog/api'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { Button } from '@/shared/ui/Button'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating'

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'all'
  const [brand, setBrand] = useState<string>('all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('featured')
  const [query, setQuery] = useState('')

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const brandsQuery = useQuery({ queryKey: ['brands'], queryFn: fetchBrands })
  const productsQuery = useQuery({
    queryKey: ['products', category, brand, inStockOnly, sort, query],
    queryFn: () =>
      fetchProducts({
        category: category === 'all' ? undefined : category,
        brand: brand === 'all' ? undefined : brand,
        in_stock: inStockOnly ? true : undefined,
        sort,
        q: query.trim() || undefined,
        page_size: 48,
      }),
  })

  const activeCategory = useMemo(
    () => categoriesQuery.data?.find((c) => c.slug === category),
    [categoriesQuery.data, category],
  )
  const categoryHidesPrice = activeCategory != null && !activeCategory.show_price
  const products = productsQuery.data?.items ?? []

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params)
    if (slug === 'all') next.delete('category')
    else next.set('category', slug)
    setParams(next, { replace: true })
    if (slug !== 'all') {
      const cat = categoriesQuery.data?.find((c) => c.slug === slug)
      if (cat && !cat.show_price && (sort === 'price-asc' || sort === 'price-desc')) {
        setSort('featured')
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface-elevated p-6 shadow-soft sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-blue/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-brand-green/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                Shop
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Phones & accessories
              </h1>
              <p className="mt-2 max-w-xl text-ink-secondary">
                Look through our products. To buy, contact us — prices are in PKR.
              </p>
            </div>
            <Link to="/contact">
              <Button variant="gradient">Order now</Button>
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6 rounded-2xl border border-border/80 bg-surface-elevated/80 p-5 shadow-soft backdrop-blur-sm lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Search</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="mt-2 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:shadow-focus"
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
              {(categoriesQuery.data ?? []).map((c) => (
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
              {(brandsQuery.data ?? []).map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
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
          {categoryHidesPrice && activeCategory && (
            <div className="mb-6 rounded-xl border border-brand-blue/25 bg-brand-blue-soft px-4 py-3 text-sm text-ink">
              <span className="font-semibold">{activeCategory.name}</span> — price is not shown
              here. Customers see “Contact for price”. Ask us for the price.
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {productsQuery.data?.meta.total ?? 0} product
              {(productsQuery.data?.meta.total ?? 0) === 1 ? '' : 's'}
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

          {productsQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {products.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-dashed border-border-strong bg-surface-elevated/60 px-6 py-16 text-center"
                >
                  <p className="font-display text-lg font-semibold text-ink">No products found</p>
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
                    Clear filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div layout className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
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
          ? 'bg-brand-gradient text-white shadow-glow-blue'
          : 'bg-white text-ink-secondary ring-1 ring-border hover:bg-brand-blue-soft hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
