import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { fetchCategories, fetchProducts } from '@/features/catalog/api'
import { CategoryCard } from '@/features/catalog/components/CategoryCard'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { fadeUp, staggerContainer } from '@/shared/lib/motion'

const heroImage =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=80'

const trustItems = [
  { title: 'Curated gear', copy: 'Phones & accessories chosen for daily performance.' },
  { title: 'PKR pricing', copy: 'Clear prices where enabled — quote when it matters.' },
  { title: 'Personal ordering', copy: 'Contact us and we confirm stock for you.' },
] as const

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35])

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const featuredQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ featured: true, page_size: 8 }),
  })

  const categories = categoriesQuery.data ?? []
  const featured = featuredQuery.data?.items ?? []

  return (
    <div>
      <section ref={heroRef} className="relative min-h-[88vh] overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <ProductImage
            src={heroImage}
            alt=""
            priority
            className="h-full min-h-[88vh] w-full"
            imgClassName="object-cover object-[center_30%] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-pulse-glow absolute -left-20 top-24 h-72 w-72 rounded-full bg-brand-blue/30 blur-3xl" />
          <div className="animate-pulse-glow absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-brand-green/25 blur-3xl [animation-delay:1.2s]" />
        </div>

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 lg:justify-center lg:pb-28 lg:pt-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-2xl space-y-7 text-white"
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_12px_#59bc46]" />
              {appConfig.name}
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Mobile gear,{' '}
              <span className="text-brand-gradient">refined.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-lg text-base leading-relaxed text-white/78 sm:text-lg"
            >
              Phones, earbuds, cases, and power — curated for everyday performance. Browse the
              catalog, then contact us to order in {appConfig.currency}.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              <Link to="/shop">
                <Button size="lg" variant="gradient">
                  Explore shop
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                >
                  Contact to order
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 sm:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            Scroll
            <span className="h-8 w-px bg-gradient-to-b from-brand-blue to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 -mt-8 px-4 sm:-mt-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          {trustItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <div className="glass-panel rounded-2xl p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                  Categories
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Shop by category
                </h2>
                <p className="mt-2 max-w-md text-ink-secondary">
                  Eight accessory lines. One premium experience.
                </p>
              </div>
              <Link
                to="/shop"
                className="hidden text-sm font-semibold text-brand-blue transition hover:text-brand-blue-hover sm:inline"
              >
                View all →
              </Link>
            </div>
          </Reveal>
          {categoriesQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 0.04}>
                  <CategoryCard category={category} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border bg-surface-elevated/80 py-20 sm:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-brand-green/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Featured
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Picks worth opening
                </h2>
                <p className="mt-2 text-ink-secondary">
                  High-intent products with live pricing rules.
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
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.05}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 bg-brand-gradient opacity-20" />
        <div className="pointer-events-none absolute -left-10 top-10 h-56 w-56 rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-brand-green/35 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Reveal>
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready when you are
              </h2>
              <p className="mt-3 text-white/70">
                No cart checkout. Tell us what you need — we confirm stock and arrange payment
                offline.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/contact">
              <Button size="lg" variant="gradient">
                Get in touch
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
