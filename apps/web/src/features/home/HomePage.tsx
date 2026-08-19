import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { fetchBrands, fetchCategories, fetchProducts } from '@/features/catalog/api'
import { CategoryCard } from '@/features/catalog/components/CategoryCard'
import { FeaturedProductsCarousel } from '@/features/home/components/FeaturedProductsCarousel'
import { HomeBrandProducts } from '@/features/home/components/HomeBrandProducts'
import { businessInfo, mapsOpenUrl, whatsappUrl } from '@/shared/config/business'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Reveal } from '@/shared/ui/Reveal'
import { Skeleton } from '@/shared/ui/Skeleton'
import { StoreMap } from '@/shared/ui/StoreMap'
import { fadeUp, staggerContainer } from '@/shared/lib/motion'

const heroImage =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=70&fm=webp'

const orderHelpImage =
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1400&q=70&fm=webp'

const trustItems = [
  {
    title: 'Good products',
    copy: 'Phones, earbuds, cases, chargers — useful items for everyday use.',
    accent: 'bg-brand-blue',
  },
  {
    title: 'Clear prices',
    copy: 'Prices shown in PKR. If price is hidden, just ask us — we tell you quickly.',
    accent: 'bg-brand-green',
  },
  {
    title: 'Easy ordering',
    copy: 'Message or call us. We check stock and help you complete the order.',
    accent: 'bg-brand-gradient',
  },
] as const

const orderSteps = [
  {
    step: '01',
    title: 'Browse the shop',
    copy: 'Open categories, compare phones and accessories, and note what you like.',
  },
  {
    step: '02',
    title: 'Message or call',
    copy: 'WhatsApp us the product — or visit the shop in Karim Park, Lahore.',
  },
  {
    step: '03',
    title: 'We finish the order',
    copy: 'We confirm stock, share the final price, and help you buy with confidence.',
  },
] as const

const homeFaqs = [
  {
    q: 'How do I buy?',
    a: 'See products online, then WhatsApp, call, or visit us. There is no cart checkout on the website — we help you place the order directly.',
  },
  {
    q: 'Why do some items say “Contact for price”?',
    a: 'For some products we share the price when you ask. Message us and we will tell you quickly.',
  },
  {
    q: 'Where is your shop?',
    a: `${businessInfo.address} Call or WhatsApp ${businessInfo.phones[0].display}.`,
  },
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
  const brandsQuery = useQuery({ queryKey: ['brands'], queryFn: fetchBrands })
  const featuredQuery = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ featured: true, page_size: 8 }),
  })

  const categories = categoriesQuery.data ?? []
  const brands = brandsQuery.data ?? []
  const featured = featuredQuery.data?.items ?? []
  const primaryPhone = businessInfo.phones[0]
  const whatsappHref = whatsappUrl(
    primaryPhone.whatsapp,
    'Assalam o Alaikum! I want help choosing a product from LabaikMobiles.',
  )

  return (
    <div>
      {/* Hero */}
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
              Phones & accessories,{' '}
              <span className="text-brand-gradient">made simple.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-lg text-base leading-relaxed text-white/78 sm:text-lg"
            >
              Find mobiles, earbuds, cases, and chargers. See prices in {appConfig.currency}, then
              WhatsApp or call us to order.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-1">
              <Link to="/shop">
                <Button size="lg" variant="gradient">
                  See products
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                >
                  Call / WhatsApp
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

      <FeaturedProductsCarousel
        products={featured}
        isLoading={featuredQuery.isLoading}
      />

      {/* Trust */}
      <section className="relative border-b border-border/60 bg-surface-elevated/55 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-stretch gap-4 sm:grid-cols-3 sm:gap-5">
            {trustItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-lift sm:p-6">
                  <span className={`mb-4 inline-block h-1 w-10 rounded-full ${item.accent}`} />
                  <p className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
                    {item.title}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                    {item.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How ordering works — reduces friction for contact-to-order */}
      <section className="relative overflow-hidden bg-[#0b1220] py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              How it works
            </p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              No online cart. Just a clear path to buy.
            </h2>
            <p className="mt-3 max-w-lg text-white/65">
              Browse here, then talk to us. We check stock and guide you to the right product.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {orderSteps.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08}>
                <div className="relative border-t border-white/15 pt-6">
                  <p className="font-display text-4xl font-semibold text-brand-blue/90">{item.step}</p>
                  <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link to="/shop">
                <Button size="lg" variant="gradient">
                  Start browsing
                </Button>
              </Link>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  WhatsApp us
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
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
                  Pick a type — phones, cases, earbuds, and more.
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
                  <CategoryCard category={category} priority={index < 4} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help choosing — visual + CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ProductImage
            src={orderHelpImage}
            alt=""
            className="h-full min-h-[28rem] w-full sm:min-h-[32rem]"
            imgClassName="object-cover object-center"
          />
          <div className="absolute inset-0 bg-ink/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/40" />
        </div>
        <div className="relative mx-auto flex min-h-[28rem] max-w-6xl items-center px-4 py-20 sm:min-h-[32rem] sm:px-6 sm:py-24">
          <Reveal>
            <div className="max-w-xl text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                Not sure what to buy?
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.08]">
                Tell us what you need. We’ll help you choose.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/72">
                Budget, phone model, charger type — send a quick message and we’ll recommend the
                right item from stock.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="gradient">
                    Ask on WhatsApp
                  </Button>
                </a>
                <a href={`tel:${primaryPhone.tel}`}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                  >
                    Call {primaryPhone.display}
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Brands stripe + products on home */}
      <HomeBrandProducts brands={brands} brandsLoading={brandsQuery.isLoading} />

      {/* Visit the shop */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-green">
                  Visit us
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Come to the shop in Karim Park
                </h2>
                <p className="mt-3 text-ink-secondary">
                  See products in person, ask questions, and take what you need the same day when
                  stock allows.
                </p>
                <div className="mt-6 space-y-3 text-sm">
                  <p className="font-medium text-ink">{businessInfo.address}</p>
                  <p className="text-ink-secondary">
                    {businessInfo.phones.map((p) => p.display).join(' · ')}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={mapsOpenUrl()} target="_blank" rel="noreferrer">
                    <Button variant="gradient">Open in Maps</Button>
                  </a>
                  <Link to="/contact">
                    <Button variant="secondary">Contact details</Button>
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <StoreMap />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="border-t border-border/60 bg-surface-elevated/55 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
                FAQ
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Quick answers
              </h2>
              <p className="mt-2 text-ink-secondary">
                The questions people ask before they message us.
              </p>
            </div>
          </Reveal>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface-elevated shadow-soft">
            {homeFaqs.map((item, index) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} defaultOpen={index === 0} />
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="mt-8 text-center">
              <Link
                to="/faq"
                className="text-sm font-semibold text-brand-blue transition hover:text-brand-blue-hover"
              >
                See all FAQ →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-[#0b1220] py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.12]" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Find what you need — then talk to {appConfig.name}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/65">
              Browse the catalog, send a WhatsApp, or walk into the shop. We’ll take it from there.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/shop">
                <Button size="lg" variant="gradient">
                  Browse shop
                </Button>
              </Link>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  WhatsApp now
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string
  answer: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="px-5 py-4 sm:px-6">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-display text-base font-semibold text-ink sm:text-lg">{question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-lg leading-none text-ink-secondary transition ${
            open ? 'rotate-45 bg-brand-blue text-white border-brand-blue' : ''
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{answer}</p>
      ) : null}
    </div>
  )
}
