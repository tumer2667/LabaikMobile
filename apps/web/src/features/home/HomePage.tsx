import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { fetchCategories, fetchProducts } from '@/features/catalog/api'
import { fetchHealth } from '@/shared/api/health'
import { CategoryCard } from '@/features/catalog/components/CategoryCard'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { fadeUp, staggerContainer } from '@/shared/lib/motion'

const heroImage =
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1600&q=80'

export function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: false,
  })
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const featuredQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ featured: true, page_size: 8 }),
  })

  const categories = categoriesQuery.data ?? []
  const featured = featuredQuery.data?.items ?? []

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ProductImage
            src={heroImage}
            alt=""
            priority
            className="h-full min-h-[520px] w-full"
            imgClassName="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/25" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-24 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pt-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 text-white"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue"
            >
              {appConfig.name}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Premium mobile gear,{' '}
              <span className="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
                simply ordered.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
            >
              Phones, earbuds, cases, chargers, and more — curated for everyday performance.
              Browse the catalog, then contact us to place your order in {appConfig.currency}.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg">Shop collection</Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Contact to order
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <Reveal>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Platform
              </p>
              {healthQuery.isSuccess && healthQuery.data ? (
                <p className="mt-2 font-display text-xl font-semibold text-white">
                  API {healthQuery.data.status.toUpperCase()} · {healthQuery.data.currency}
                </p>
              ) : (
                <p className="mt-2 text-sm text-white/70">Connecting to catalog API…</p>
              )}
              <p className="mt-2 text-xs text-white/50">
                Catalog is live. Images can be replaced via Admin (URL now, Storage next).
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-surface-elevated/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                  Shop by category
                </h2>
                <p className="mt-2 text-ink-secondary">Eight accessory lines, one aesthetic.</p>
              </div>
              <Link
                to="/shop"
                className="hidden text-sm font-semibold text-brand-blue hover:text-brand-blue-hover sm:inline"
              >
                View all →
              </Link>
            </div>
          </Reveal>
          {categoriesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 0.03}>
                  <CategoryCard category={category} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                  Featured picks
                </h2>
                <p className="mt-2 text-ink-secondary">
                  High-intent products with sale badges and stock states.
                </p>
              </div>
              <Link to="/shop">
                <Button variant="secondary" size="sm">
                  Browse shop
                </Button>
              </Link>
            </div>
          </Reveal>
          {featuredQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.04}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-ink py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Ready when you are
            </h2>
            <p className="mt-2 text-white/70">
              No cart checkout yet. Tell us what you need — we confirm stock and arrange payment
              offline.
            </p>
          </div>
          <Link to="/contact">
            <Button size="lg" variant="accent">
              Get in touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
