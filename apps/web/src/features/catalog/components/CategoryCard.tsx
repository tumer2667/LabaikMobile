import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import type { DemoCategory } from '@/entities/catalog/demo-data'
import { ProductImage } from '@/shared/ui/ProductImage'
import { cn } from '@/shared/lib/cn'

type CategoryCardProps = {
  category: DemoCategory
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <Link
        to={`/shop?category=${category.slug}`}
        className={cn(
          'group relative block overflow-hidden rounded-xl border border-border shadow-soft',
          className,
        )}
      >
        <ProductImage
          src={category.image}
          alt={category.name}
          className="aspect-[4/3]"
          imgClassName="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display text-lg font-semibold">{category.name}</h3>
          <p className="mt-0.5 text-sm text-white/75">
            {category.productCount} products
            {!category.showPrice ? ' · Price on request' : ''}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
