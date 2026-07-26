import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import type { Category } from '@/entities/catalog/types'
import { ProductImage } from '@/shared/ui/ProductImage'
import { cn } from '@/shared/lib/cn'

type CategoryCardProps = {
  category: Category
  className?: string
  priority?: boolean
}

export function CategoryCard({ category, className, priority = false }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/shop?category=${category.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-2xl border border-border/70 shadow-soft transition hover:shadow-lift',
          className,
        )}
      >
        <ProductImage
          src={category.image_url ?? ''}
          alt={category.name}
          className="aspect-[4/3]"
          imgClassName="transition duration-700 group-hover:scale-110"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/25 to-brand-green/20" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
          <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            {category.name}
          </h3>
          <p className="mt-1 text-sm text-white/75">
            {category.product_count} products
            {!category.show_price ? ' · Ask for price' : ''}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue opacity-0 transition group-hover:opacity-100">
            View items →
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
