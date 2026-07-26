from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.slug import slugify
from app.domain.models.enums import ProductStatus
from app.infrastructure.db.models import Brand, Category, Product, ProductImage


SEED_CATEGORIES = [
    {
        "name": "Phones",
        "slug": "phones",
        "description": "Flagships and everyday smartphones",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
        "show_price": False,
        "sort_order": 1,
    },
    {
        "name": "Earbuds",
        "slug": "earbuds",
        "description": "Wireless audio that stays with you",
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 2,
    },
    {
        "name": "Phone cases",
        "slug": "cases",
        "description": "Protection without bulk",
        "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 3,
    },
    {
        "name": "Chargers",
        "slug": "chargers",
        "description": "Fast, reliable power delivery",
        "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36338f14?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 4,
    },
    {
        "name": "Power banks",
        "slug": "power-banks",
        "description": "Charge on the move",
        "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 5,
    },
    {
        "name": "Smart watches",
        "slug": "smart-watches",
        "description": "Health and connectivity on your wrist",
        "image_url": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=900&q=80",
        "show_price": False,
        "sort_order": 6,
    },
    {
        "name": "Screen protectors",
        "slug": "screen-protectors",
        "description": "Crystal clarity, lasting protection",
        "image_url": "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 7,
    },
    {
        "name": "Cables",
        "slug": "cables",
        "description": "Durable USB-C and Lightning essentials",
        "image_url": "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=900&q=80",
        "show_price": True,
        "sort_order": 8,
    },
]

SEED_PRODUCTS = [
    {
        "name": "Aurora Pro Max",
        "slug": "aurora-pro-max",
        "brand": "Labaik",
        "category": "phones",
        "price_pkr": 189999,
        "compare_at_pkr": 209999,
        "rating": 4.8,
        "review_count": 124,
        "in_stock": True,
        "is_featured": True,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Graphite", "Silver", "Ocean"],
        "short_description": "Flagship performance with a cinematic display.",
        "description": "Aurora Pro Max pairs a bright OLED panel with all-day battery and a versatile camera system.",
        "highlights": ["6.7\" OLED 120Hz", "256GB storage", "5G ready", "IP68"],
    },
    {
        "name": "Nova Lite 5G",
        "slug": "nova-lite-5g",
        "brand": "Labaik",
        "category": "phones",
        "price_pkr": 74999,
        "rating": 4.5,
        "review_count": 89,
        "in_stock": True,
        "is_featured": True,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Midnight", "Pearl"],
        "short_description": "Everyday 5G without compromise.",
        "description": "A balanced mid-range phone with smooth software and reliable battery life.",
        "highlights": ["6.5\" AMOLED", "128GB", "Fast charge 45W"],
    },
    {
        "name": "Pulse Buds Pro",
        "slug": "pulse-buds-pro",
        "brand": "Labaik Audio",
        "category": "earbuds",
        "price_pkr": 18999,
        "compare_at_pkr": 22999,
        "rating": 4.7,
        "review_count": 210,
        "in_stock": True,
        "is_featured": True,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Black", "White"],
        "short_description": "ANC earbuds with spatial clarity.",
        "description": "Active noise cancellation, multipoint Bluetooth, and a compact case.",
        "highlights": ["ANC + Transparency", "36h total battery", "IPX4"],
    },
    {
        "name": "Echo Buds Mini",
        "slug": "echo-buds-mini",
        "brand": "Labaik Audio",
        "category": "earbuds",
        "price_pkr": 7999,
        "rating": 4.3,
        "review_count": 56,
        "in_stock": True,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Black"],
        "short_description": "Compact sound for daily commute.",
        "description": "Lightweight buds with clear calls and a pocket-friendly case.",
        "highlights": ["Touch controls", "24h case", "USB-C"],
    },
    {
        "name": "Shield Matte Case",
        "slug": "shield-matte-case",
        "brand": "ArmorLab",
        "category": "cases",
        "price_pkr": 2499,
        "rating": 4.6,
        "review_count": 340,
        "in_stock": True,
        "is_featured": True,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Sand", "Slate", "Olive"],
        "short_description": "Soft-touch armour with raised edges.",
        "description": "Military-grade drop protection in a slim matte shell.",
        "highlights": ["2m drop rated", "MagSafe compatible", "Anti-slip"],
    },
    {
        "name": "Clear Air Case",
        "slug": "clear-air-case",
        "brand": "ArmorLab",
        "category": "cases",
        "price_pkr": 1999,
        "rating": 4.4,
        "review_count": 98,
        "in_stock": True,
        "is_featured": False,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Clear"],
        "short_description": "Show the design. Keep it safe.",
        "description": "Crystal-clear polycarbonate with yellowing-resistant coating.",
        "highlights": ["Anti-yellow", "Slim profile", "Camera rim"],
    },
    {
        "name": "Volt 65W GaN Charger",
        "slug": "volt-65w-gan",
        "brand": "PowerGrid",
        "category": "chargers",
        "price_pkr": 6499,
        "compare_at_pkr": 7999,
        "rating": 4.9,
        "review_count": 177,
        "in_stock": True,
        "is_featured": True,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1583863788434-e58a36338f14?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["White"],
        "short_description": "Laptop + phone from one compact brick.",
        "description": "GaN efficiency with dual USB-C ports.",
        "highlights": ["65W GaN", "2× USB-C", "Folding prongs"],
    },
    {
        "name": "Spark 20W Wall Charger",
        "slug": "spark-20w-wall",
        "brand": "PowerGrid",
        "category": "chargers",
        "price_pkr": 2499,
        "rating": 4.5,
        "review_count": 64,
        "in_stock": True,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["White", "Black"],
        "short_description": "Everyday fast charge for phones.",
        "description": "PD 20W wall adapter with over-voltage protection.",
        "highlights": ["USB-C PD", "Compact", "Safety certified"],
    },
    {
        "name": "Endurance 20K Power Bank",
        "slug": "endurance-20k",
        "brand": "PowerGrid",
        "category": "power-banks",
        "price_pkr": 8999,
        "rating": 4.7,
        "review_count": 142,
        "in_stock": True,
        "is_featured": True,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Black"],
        "short_description": "Weekend-ready 20,000 mAh capacity.",
        "description": "Dual output with digital display and pass-through charging.",
        "highlights": ["20,000 mAh", "LED display", "22.5W output"],
    },
    {
        "name": "Pocket 10K Slim",
        "slug": "pocket-10k-slim",
        "brand": "PowerGrid",
        "category": "power-banks",
        "price_pkr": 4999,
        "rating": 4.4,
        "review_count": 71,
        "in_stock": False,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Silver"],
        "short_description": "Slim enough for a jacket pocket.",
        "description": "10,000 mAh in a card-like form factor.",
        "highlights": ["10,000 mAh", "18W PD", "Airline safe"],
    },
    {
        "name": "Orbit Watch S3",
        "slug": "orbit-watch-s3",
        "brand": "Labaik Wear",
        "category": "smart-watches",
        "price_pkr": 32999,
        "compare_at_pkr": 37999,
        "rating": 4.6,
        "review_count": 95,
        "in_stock": True,
        "is_featured": True,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Black", "Starlight"],
        "short_description": "AMOLED fitness companion.",
        "description": "SpO2, GPS, and 7-day battery with always-on display option.",
        "highlights": ["1.43\" AMOLED", "GPS", "5ATM"],
    },
    {
        "name": "Glass Armor 9H",
        "slug": "glass-armor-9h",
        "brand": "ArmorLab",
        "category": "screen-protectors",
        "price_pkr": 1499,
        "rating": 4.8,
        "review_count": 412,
        "in_stock": True,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Clear"],
        "short_description": "Edge-to-edge tempered glass.",
        "description": "Oleophobic coating with alignment tray for dust-free install.",
        "highlights": ["9H hardness", "Case friendly", "2-pack"],
    },
    {
        "name": "Link Cable 2m Braided",
        "slug": "link-cable-2m",
        "brand": "PowerGrid",
        "category": "cables",
        "price_pkr": 1799,
        "rating": 4.5,
        "review_count": 188,
        "in_stock": True,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Black", "Blue"],
        "short_description": "Braided USB-C that survives daily abuse.",
        "description": "100W-rated USB-C to USB-C with reinforced strain relief.",
        "highlights": ["2 metre", "100W PD", "Nylon braid"],
    },
    {
        "name": "Flex Lightning 1m",
        "slug": "flex-lightning-1m",
        "brand": "PowerGrid",
        "category": "cables",
        "price_pkr": 2199,
        "rating": 4.2,
        "review_count": 43,
        "in_stock": True,
        "is_featured": False,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["White"],
        "short_description": "MFi-certified Lightning for older devices.",
        "description": "Reliable charge and sync with soft-touch jacket.",
        "highlights": ["MFi", "1 metre", "Data sync"],
    },
    {
        "name": "Studio Buds+",
        "slug": "studio-buds-studio",
        "brand": "Labaik Audio",
        "category": "earbuds",
        "price_pkr": 24999,
        "rating": 4.9,
        "review_count": 67,
        "in_stock": True,
        "is_featured": False,
        "is_new": True,
        "images": [
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Ivory"],
        "short_description": "Studio-tuned drivers, travel-ready case.",
        "description": "Hi-res wireless audio with adaptive EQ.",
        "highlights": ["LDAC", "Adaptive EQ", "Wireless case"],
    },
    {
        "name": "Carbon Folio Case",
        "slug": "carbon-folio-case",
        "brand": "ArmorLab",
        "category": "cases",
        "price_pkr": 3499,
        "rating": 4.5,
        "review_count": 52,
        "in_stock": True,
        "is_featured": False,
        "is_new": False,
        "images": [
            "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
        ],
        "colors": ["Carbon"],
        "short_description": "Wallet folio with magnetic closure.",
        "description": "Holds two cards and stands for media in landscape.",
        "highlights": ["Card slots", "Kickstand", "Soft microfibre"],
    },
]


def ensure_catalog_seed(db: Session) -> None:
    existing = db.scalar(select(func.count()).select_from(Product))
    if existing and existing > 0:
        return

    categories: dict[str, Category] = {}
    for item in SEED_CATEGORIES:
        cat = Category(
            name=item["name"],
            slug=item["slug"],
            description=item["description"],
            image_url=item["image_url"],
            show_price=item["show_price"],
            sort_order=item["sort_order"],
            is_active=True,
        )
        db.add(cat)
        categories[item["slug"]] = cat
    db.flush()

    brands: dict[str, Brand] = {}
    for item in SEED_PRODUCTS:
        brand_name = item["brand"]
        if brand_name not in brands:
            brand = Brand(name=brand_name, slug=slugify(brand_name), is_active=True)
            db.add(brand)
            db.flush()
            brands[brand_name] = brand

        product = Product(
            name=item["name"],
            slug=item["slug"],
            brand_id=brands[brand_name].id,
            category_id=categories[item["category"]].id,
            short_description=item["short_description"],
            description=item["description"],
            price_pkr=item["price_pkr"],
            compare_at_pkr=item.get("compare_at_pkr"),
            show_price=categories[item["category"]].show_price,
            status=ProductStatus.ACTIVE.value,
            in_stock=item["in_stock"],
            is_featured=item["is_featured"],
            is_new=item["is_new"],
            rating=item["rating"],
            review_count=item["review_count"],
            colors=item["colors"],
            highlights=item["highlights"],
        )
        db.add(product)
        db.flush()
        for index, url in enumerate(item["images"]):
            db.add(
                ProductImage(
                    product_id=product.id,
                    url=url,
                    sort_order=index,
                    is_primary=index == 0,
                )
            )

    db.commit()
