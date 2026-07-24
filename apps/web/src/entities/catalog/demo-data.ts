export type DemoCategory = {
  id: string
  slug: string
  name: string
  description: string
  image: string
  productCount: number
  /** Admin toggle: when false, storefront hides PKR and shows “Contact for price”. */
  showPrice: boolean
}

export type DemoProduct = {
  id: string
  slug: string
  name: string
  brand: string
  categorySlug: string
  pricePkr: number
  compareAtPkr?: number
  rating: number
  reviewCount: number
  inStock: boolean
  isFeatured: boolean
  isNew: boolean
  images: string[]
  colors: string[]
  shortDescription: string
  description: string
  highlights: string[]
}

/** Demo imagery via Unsplash — replace via Admin → Supabase Storage later. */
export const demoCategories: DemoCategory[] = [
  {
    id: '1',
    slug: 'phones',
    name: 'Phones',
    description: 'Flagships and everyday smartphones',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    productCount: 4,
    // Demo: admin “Show price” OFF — quote via contact
    showPrice: false,
  },
  {
    id: '2',
    slug: 'earbuds',
    name: 'Earbuds',
    description: 'Wireless audio that stays with you',
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80',
    productCount: 3,
    showPrice: true,
  },
  {
    id: '3',
    slug: 'cases',
    name: 'Phone cases',
    description: 'Protection without bulk',
    image:
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80',
    productCount: 3,
    showPrice: true,
  },
  {
    id: '4',
    slug: 'chargers',
    name: 'Chargers',
    description: 'Fast, reliable power delivery',
    image:
      'https://images.unsplash.com/photo-1583863788434-e58a36338f14?auto=format&fit=crop&w=900&q=80',
    productCount: 2,
    showPrice: true,
  },
  {
    id: '5',
    slug: 'power-banks',
    name: 'Power banks',
    description: 'Charge on the move',
    image:
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80',
    productCount: 2,
    showPrice: true,
  },
  {
    id: '6',
    slug: 'smart-watches',
    name: 'Smart watches',
    description: 'Health and connectivity on your wrist',
    image:
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80',
    productCount: 2,
    // Demo: admin “Show price” OFF
    showPrice: false,
  },
  {
    id: '7',
    slug: 'screen-protectors',
    name: 'Screen protectors',
    description: 'Crystal clarity, lasting protection',
    image:
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80',
    productCount: 1,
    showPrice: true,
  },
  {
    id: '8',
    slug: 'cables',
    name: 'Cables',
    description: 'Durable USB-C and Lightning essentials',
    image:
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=900&q=80',
    productCount: 2,
    showPrice: true,
  },
]

export const demoProducts: DemoProduct[] = [
  {
    id: 'p1',
    slug: 'aurora-pro-max',
    name: 'Aurora Pro Max',
    brand: 'Labaik',
    categorySlug: 'phones',
    pricePkr: 189999,
    compareAtPkr: 209999,
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isFeatured: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Graphite', 'Silver', 'Ocean'],
    shortDescription: 'Flagship performance with a cinematic display.',
    description:
      'Aurora Pro Max pairs a bright OLED panel with all-day battery and a versatile camera system. Built for everyday speed without the clutter.',
    highlights: ['6.7" OLED 120Hz', '256GB storage', '5G ready', 'IP68'],
  },
  {
    id: 'p2',
    slug: 'nova-lite-5g',
    name: 'Nova Lite 5G',
    brand: 'Labaik',
    categorySlug: 'phones',
    pricePkr: 74999,
    rating: 4.5,
    reviewCount: 89,
    inStock: true,
    isFeatured: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Midnight', 'Pearl'],
    shortDescription: 'Everyday 5G without compromise.',
    description:
      'A balanced mid-range phone with smooth software, solid cameras, and reliable battery life for work and play.',
    highlights: ['6.5" AMOLED', '128GB', 'Fast charge 45W'],
  },
  {
    id: 'p3',
    slug: 'pulse-buds-pro',
    name: 'Pulse Buds Pro',
    brand: 'Labaik Audio',
    categorySlug: 'earbuds',
    pricePkr: 18999,
    compareAtPkr: 22999,
    rating: 4.7,
    reviewCount: 210,
    inStock: true,
    isFeatured: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Black', 'White'],
    shortDescription: 'ANC earbuds with spatial clarity.',
    description:
      'Active noise cancellation, multipoint Bluetooth, and a compact case that charges wirelessly.',
    highlights: ['ANC + Transparency', '36h total battery', 'IPX4'],
  },
  {
    id: 'p4',
    slug: 'echo-buds-mini',
    name: 'Echo Buds Mini',
    brand: 'Labaik Audio',
    categorySlug: 'earbuds',
    pricePkr: 7999,
    rating: 4.3,
    reviewCount: 56,
    inStock: true,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Black'],
    shortDescription: 'Compact sound for daily commute.',
    description: 'Lightweight buds with clear calls and a pocket-friendly charging case.',
    highlights: ['Touch controls', '24h case', 'USB-C'],
  },
  {
    id: 'p5',
    slug: 'shield-matte-case',
    name: 'Shield Matte Case',
    brand: 'ArmorLab',
    categorySlug: 'cases',
    pricePkr: 2499,
    rating: 4.6,
    reviewCount: 340,
    inStock: true,
    isFeatured: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Sand', 'Slate', 'Olive'],
    shortDescription: 'Soft-touch armour with raised edges.',
    description: 'Military-grade drop protection in a slim matte shell that resists fingerprints.',
    highlights: ['2m drop rated', 'MagSafe compatible', 'Anti-slip'],
  },
  {
    id: 'p6',
    slug: 'clear-air-case',
    name: 'Clear Air Case',
    brand: 'ArmorLab',
    categorySlug: 'cases',
    pricePkr: 1999,
    rating: 4.4,
    reviewCount: 98,
    inStock: true,
    isFeatured: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Clear'],
    shortDescription: 'Show the design. Keep it safe.',
    description: 'Crystal-clear polycarbonate with yellowing-resistant coating.',
    highlights: ['Anti-yellow', 'Slim profile', 'Camera rim'],
  },
  {
    id: 'p7',
    slug: 'volt-65w-gan',
    name: 'Volt 65W GaN Charger',
    brand: 'PowerGrid',
    categorySlug: 'chargers',
    pricePkr: 6499,
    compareAtPkr: 7999,
    rating: 4.9,
    reviewCount: 177,
    inStock: true,
    isFeatured: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36338f14?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['White'],
    shortDescription: 'Laptop + phone from one compact brick.',
    description: 'GaN efficiency with dual USB-C ports and intelligent power distribution.',
    highlights: ['65W GaN', '2× USB-C', 'Folding prongs'],
  },
  {
    id: 'p8',
    slug: 'spark-20w-wall',
    name: 'Spark 20W Wall Charger',
    brand: 'PowerGrid',
    categorySlug: 'chargers',
    pricePkr: 2499,
    rating: 4.5,
    reviewCount: 64,
    inStock: true,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['White', 'Black'],
    shortDescription: 'Everyday fast charge for phones.',
    description: 'PD 20W wall adapter with over-voltage protection.',
    highlights: ['USB-C PD', 'Compact', 'Safety certified'],
  },
  {
    id: 'p9',
    slug: 'endurance-20k',
    name: 'Endurance 20K Power Bank',
    brand: 'PowerGrid',
    categorySlug: 'power-banks',
    pricePkr: 8999,
    rating: 4.7,
    reviewCount: 142,
    inStock: true,
    isFeatured: true,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Black'],
    shortDescription: 'Weekend-ready 20,000 mAh capacity.',
    description: 'Dual output with digital display and pass-through charging.',
    highlights: ['20,000 mAh', 'LED display', '22.5W output'],
  },
  {
    id: 'p10',
    slug: 'pocket-10k-slim',
    name: 'Pocket 10K Slim',
    brand: 'PowerGrid',
    categorySlug: 'power-banks',
    pricePkr: 4999,
    rating: 4.4,
    reviewCount: 71,
    inStock: false,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Silver'],
    shortDescription: 'Slim enough for a jacket pocket.',
    description: '10,000 mAh in a card-like form factor with USB-C in/out.',
    highlights: ['10,000 mAh', '18W PD', 'Airline safe'],
  },
  {
    id: 'p11',
    slug: 'orbit-watch-s3',
    name: 'Orbit Watch S3',
    brand: 'Labaik Wear',
    categorySlug: 'smart-watches',
    pricePkr: 32999,
    compareAtPkr: 37999,
    rating: 4.6,
    reviewCount: 95,
    inStock: true,
    isFeatured: true,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Black', 'Starlight'],
    shortDescription: 'AMOLED fitness companion.',
    description: 'SpO2, GPS, and 7-day battery with always-on display option.',
    highlights: ['1.43" AMOLED', 'GPS', '5ATM'],
  },
  {
    id: 'p12',
    slug: 'glass-armor-9h',
    name: 'Glass Armor 9H',
    brand: 'ArmorLab',
    categorySlug: 'screen-protectors',
    pricePkr: 1499,
    rating: 4.8,
    reviewCount: 412,
    inStock: true,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Clear'],
    shortDescription: 'Edge-to-edge tempered glass.',
    description: 'Oleophobic coating with alignment tray for dust-free install.',
    highlights: ['9H hardness', 'Case friendly', '2-pack'],
  },
  {
    id: 'p13',
    slug: 'link-cable-2m',
    name: 'Link Cable 2m Braided',
    brand: 'PowerGrid',
    categorySlug: 'cables',
    pricePkr: 1799,
    rating: 4.5,
    reviewCount: 188,
    inStock: true,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Black', 'Blue'],
    shortDescription: 'Braided USB-C that survives daily abuse.',
    description: '100W-rated USB-C to USB-C with reinforced strain relief.',
    highlights: ['2 metre', '100W PD', 'Nylon braid'],
  },
  {
    id: 'p14',
    slug: 'flex-lightning-1m',
    name: 'Flex Lightning 1m',
    brand: 'PowerGrid',
    categorySlug: 'cables',
    pricePkr: 2199,
    rating: 4.2,
    reviewCount: 43,
    inStock: true,
    isFeatured: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['White'],
    shortDescription: 'MFi-certified Lightning for older devices.',
    description: 'Reliable charge and sync with soft-touch jacket.',
    highlights: ['MFi', '1 metre', 'Data sync'],
  },
  {
    id: 'p15',
    slug: 'studio-buds-studio',
    name: 'Studio Buds+',
    brand: 'Labaik Audio',
    categorySlug: 'earbuds',
    pricePkr: 24999,
    rating: 4.9,
    reviewCount: 67,
    inStock: true,
    isFeatured: false,
    isNew: true,
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Ivory'],
    shortDescription: 'Studio-tuned drivers, travel-ready case.',
    description: 'Hi-res wireless audio with adaptive EQ and find-my support.',
    highlights: ['LDAC', 'Adaptive EQ', 'Wireless case'],
  },
  {
    id: 'p16',
    slug: 'carbon-folio-case',
    name: 'Carbon Folio Case',
    brand: 'ArmorLab',
    categorySlug: 'cases',
    pricePkr: 3499,
    rating: 4.5,
    reviewCount: 52,
    inStock: true,
    isFeatured: false,
    isNew: false,
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
    ],
    colors: ['Carbon'],
    shortDescription: 'Wallet folio with magnetic closure.',
    description: 'Holds two cards and stands for media in landscape.',
    highlights: ['Card slots', 'Kickstand', 'Soft microfibre'],
  },
]

export function getProductBySlug(slug: string): DemoProduct | undefined {
  return demoProducts.find((p) => p.slug === slug)
}

export function getCategoryBySlug(slug: string): DemoCategory | undefined {
  return demoCategories.find((c) => c.slug === slug)
}

/** Storefront visibility — driven by category admin toggle `showPrice`. */
export function categoryShowsPrice(categorySlug: string): boolean {
  return getCategoryBySlug(categorySlug)?.showPrice ?? true
}

export function productShowsPrice(product: DemoProduct): boolean {
  return categoryShowsPrice(product.categorySlug)
}

export function getFeaturedProducts(): DemoProduct[] {
  return demoProducts.filter((p) => p.isFeatured)
}

export function getProductsByCategory(categorySlug: string): DemoProduct[] {
  return demoProducts.filter((p) => p.categorySlug === categorySlug)
}

export const demoBrands = [...new Set(demoProducts.map((p) => p.brand))].sort()
