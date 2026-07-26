from __future__ import annotations

from uuid import UUID

from fastapi import status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.core.slug import slugify
from app.domain.models.enums import ProductStatus
from app.infrastructure.db.models import Brand, Category, Product, ProductImage
from app.schemas.catalog import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    ProductCreate,
    ProductDetail,
    ProductListItem,
    ProductListResponse,
    ProductUpdate,
)


def _product_images(product: Product) -> list[str]:
    return [img.url for img in sorted(product.images, key=lambda i: i.sort_order)]


def to_product_list_item(product: Product) -> ProductListItem:
    images = _product_images(product)
    return ProductListItem(
        id=product.id,
        name=product.name,
        slug=product.slug,
        brand_id=product.brand_id,
        brand=product.brand.name,
        brand_slug=product.brand.slug,
        category_id=product.category_id,
        category_slug=product.category.slug,
        category_name=product.category.name,
        show_price=product.show_price,
        price_pkr=product.price_pkr,
        compare_at_pkr=product.compare_at_pkr,
        rating=product.rating,
        review_count=product.review_count,
        in_stock=product.in_stock,
        is_featured=product.is_featured,
        is_new=product.is_new,
        short_description=product.short_description,
        primary_image=images[0] if images else None,
        images=images,
    )


def to_product_detail(product: Product) -> ProductDetail:
    base = to_product_list_item(product)
    return ProductDetail(
        **base.model_dump(),
        description=product.description,
        colors=list(product.colors or []),
        highlights=list(product.highlights or []),
        status=product.status,
        created_at=product.created_at,
        cost_pkr=product.cost_pkr,
    )


def to_category_response(category: Category, product_count: int = 0) -> CategoryResponse:
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        image_url=category.image_url,
        show_price=category.show_price,
        sort_order=category.sort_order,
        is_active=category.is_active,
        product_count=product_count,
    )


def list_categories(db: Session, *, active_only: bool = True) -> list[CategoryResponse]:
    stmt = select(Category).order_by(Category.sort_order.asc(), Category.name.asc())
    if active_only:
        stmt = stmt.where(Category.is_active.is_(True))
    categories = list(db.scalars(stmt))
    counts = dict(
        db.execute(
            select(Product.category_id, func.count())
            .where(Product.status == ProductStatus.ACTIVE.value)
            .group_by(Product.category_id)
        ).all()
    )
    return [to_category_response(c, int(counts.get(c.id, 0))) for c in categories]


def get_category_by_slug(db: Session, slug: str) -> CategoryResponse:
    category = db.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        raise AppError("Category not found", code="category_not_found", status_code=404)
    count = db.scalar(
        select(func.count())
        .select_from(Product)
        .where(
            Product.category_id == category.id,
            Product.status == ProductStatus.ACTIVE.value,
        )
    )
    return to_category_response(category, int(count or 0))


def list_brands(db: Session, *, active_only: bool = True) -> list[BrandResponse]:
    stmt = select(Brand).order_by(Brand.name.asc())
    if active_only:
        stmt = stmt.where(Brand.is_active.is_(True))
    return [BrandResponse.model_validate(b) for b in db.scalars(stmt)]


def _product_query(*, include_inactive: bool = False):
    stmt = select(Product).options(
        selectinload(Product.brand),
        selectinload(Product.category),
        selectinload(Product.images),
    )
    if not include_inactive:
        stmt = stmt.where(Product.status == ProductStatus.ACTIVE.value)
    return stmt


def list_products(
    db: Session,
    *,
    category: str | None = None,
    brand: str | None = None,
    q: str | None = None,
    in_stock: bool | None = None,
    featured: bool | None = None,
    sort: str = "featured",
    page: int = 1,
    page_size: int = 24,
    include_inactive: bool = False,
) -> ProductListResponse:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    stmt = _product_query(include_inactive=include_inactive)
    if category:
        stmt = stmt.where(Product.category.has(Category.slug == category))
    if brand:
        stmt = stmt.where(Product.brand.has(Brand.slug == brand))
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(like),
                Product.short_description.ilike(like),
                Product.description.ilike(like),
            )
        )
    if in_stock is True:
        stmt = stmt.where(Product.in_stock.is_(True))
    if featured is True:
        stmt = stmt.where(Product.is_featured.is_(True))

    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0

    if sort == "price-asc":
        stmt = stmt.order_by(Product.price_pkr.asc())
    elif sort == "price-desc":
        stmt = stmt.order_by(Product.price_pkr.desc())
    elif sort == "rating":
        stmt = stmt.order_by(Product.rating.desc())
    elif sort == "newest":
        stmt = stmt.order_by(Product.created_at.desc())
    else:
        stmt = stmt.order_by(Product.is_featured.desc(), Product.created_at.desc())

    items = list(
        db.scalars(stmt.offset((page - 1) * page_size).limit(page_size))
    )
    return ProductListResponse(
        items=[to_product_list_item(p) for p in items],
        meta={"page": page, "page_size": page_size, "total": int(total)},
    )


def get_product_by_slug(db: Session, slug: str, *, include_inactive: bool = False) -> ProductDetail:
    stmt = _product_query(include_inactive=include_inactive).where(Product.slug == slug)
    product = db.scalar(stmt)
    if product is None:
        raise AppError("Product not found", code="product_not_found", status_code=404)
    return to_product_detail(product)


def get_product_by_id(db: Session, product_id: UUID) -> Product:
    product = db.scalar(
        _product_query(include_inactive=True).where(Product.id == product_id)
    )
    if product is None:
        raise AppError("Product not found", code="product_not_found", status_code=404)
    return product


def _unique_slug(db: Session, model: type[Brand] | type[Category] | type[Product], base: str) -> str:
    slug = slugify(base) or "item"
    candidate = slug
    i = 2
    while db.scalar(select(model.id).where(model.slug == candidate)):
        candidate = f"{slug}-{i}"
        i += 1
    return candidate


def create_category(db: Session, payload: CategoryCreate) -> CategoryResponse:
    slug = payload.slug or _unique_slug(db, Category, payload.name)
    if db.scalar(select(Category.id).where(Category.slug == slug)):
        raise AppError("Category slug already exists", code="slug_taken", status_code=409)
    category = Category(
        name=payload.name.strip(),
        slug=slugify(slug),
        description=payload.description,
        image_url=payload.image_url,
        show_price=payload.show_price,
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return to_category_response(category, 0)


def update_category(db: Session, category_id: UUID, payload: CategoryUpdate) -> CategoryResponse:
    category = db.get(Category, category_id)
    if category is None:
        raise AppError("Category not found", code="category_not_found", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = slugify(data["slug"])
        conflict = db.scalar(
            select(Category.id).where(Category.slug == data["slug"], Category.id != category_id)
        )
        if conflict:
            raise AppError("Category slug already exists", code="slug_taken", status_code=409)
    for key, value in data.items():
        setattr(category, key, value)
    db.add(category)
    db.commit()
    db.refresh(category)
    count = db.scalar(
        select(func.count()).select_from(Product).where(Product.category_id == category.id)
    )
    return to_category_response(category, int(count or 0))


def create_brand(db: Session, payload: BrandCreate) -> BrandResponse:
    slug = payload.slug or _unique_slug(db, Brand, payload.name)
    if db.scalar(select(Brand.id).where(Brand.slug == slugify(slug))):
        raise AppError("Brand slug already exists", code="slug_taken", status_code=409)
    brand = Brand(name=payload.name.strip(), slug=slugify(slug), is_active=payload.is_active)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return BrandResponse.model_validate(brand)


def update_brand(db: Session, brand_id: UUID, payload: BrandUpdate) -> BrandResponse:
    brand = db.get(Brand, brand_id)
    if brand is None:
        raise AppError("Brand not found", code="brand_not_found", status_code=404)
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = slugify(data["slug"])
    for key, value in data.items():
        setattr(brand, key, value)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return BrandResponse.model_validate(brand)


def _replace_images(db: Session, product: Product, urls: list[str]) -> None:
    product.images.clear()
    db.flush()
    for index, url in enumerate(urls):
        if not url.strip():
            continue
        product.images.append(
            ProductImage(url=url.strip(), sort_order=index, is_primary=index == 0)
        )


def create_product(db: Session, payload: ProductCreate) -> ProductDetail:
    if not db.get(Brand, payload.brand_id):
        raise AppError("Brand not found", code="brand_not_found", status_code=404)
    if not db.get(Category, payload.category_id):
        raise AppError("Category not found", code="category_not_found", status_code=404)

    slug = payload.slug or _unique_slug(db, Product, payload.name)
    if db.scalar(select(Product.id).where(Product.slug == slugify(slug))):
        raise AppError("Product slug already exists", code="slug_taken", status_code=409)

    product = Product(
        name=payload.name.strip(),
        slug=slugify(slug),
        brand_id=payload.brand_id,
        category_id=payload.category_id,
        short_description=payload.short_description,
        description=payload.description,
        price_pkr=payload.price_pkr,
        compare_at_pkr=payload.compare_at_pkr,
        cost_pkr=payload.cost_pkr,
        show_price=payload.show_price,
        status=payload.status,
        in_stock=payload.in_stock,
        is_featured=payload.is_featured,
        is_new=payload.is_new,
        rating=payload.rating,
        review_count=payload.review_count,
        colors=payload.colors,
        highlights=payload.highlights,
    )
    db.add(product)
    db.flush()
    _replace_images(db, product, payload.image_urls)
    db.commit()
    return get_product_by_id_detail(db, product.id)


def get_product_by_id_detail(db: Session, product_id: UUID) -> ProductDetail:
    product = get_product_by_id(db, product_id)
    return to_product_detail(product)


def update_product(db: Session, product_id: UUID, payload: ProductUpdate) -> ProductDetail:
    product = get_product_by_id(db, product_id)
    data = payload.model_dump(exclude_unset=True)
    image_urls = data.pop("image_urls", None)

    if "brand_id" in data and data["brand_id"] and not db.get(Brand, data["brand_id"]):
        raise AppError("Brand not found", code="brand_not_found", status_code=404)
    if "category_id" in data and data["category_id"] and not db.get(Category, data["category_id"]):
        raise AppError("Category not found", code="category_not_found", status_code=404)
    if "slug" in data and data["slug"]:
        data["slug"] = slugify(data["slug"])
        conflict = db.scalar(
            select(Product.id).where(Product.slug == data["slug"], Product.id != product_id)
        )
        if conflict:
            raise AppError("Product slug already exists", code="slug_taken", status_code=409)

    for key, value in data.items():
        setattr(product, key, value)
    if image_urls is not None:
        _replace_images(db, product, image_urls)

    db.add(product)
    db.commit()
    return get_product_by_id_detail(db, product_id)


def delete_product(db: Session, product_id: UUID) -> None:
    """Permanently remove a product and its images."""
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()


def delete_category(db: Session, category_id: UUID) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise AppError("Category not found", code="category_not_found", status_code=404)
    product_count = db.scalar(
        select(func.count()).select_from(Product).where(Product.category_id == category_id)
    )
    if product_count and product_count > 0:
        raise AppError(
            f"Cannot delete category while {product_count} product(s) still use it. "
            "Reassign or delete those products first.",
            code="category_in_use",
            status_code=status.HTTP_409_CONFLICT,
        )
    db.delete(category)
    db.commit()


def delete_brand(db: Session, brand_id: UUID) -> None:
    brand = db.get(Brand, brand_id)
    if brand is None:
        raise AppError("Brand not found", code="brand_not_found", status_code=404)
    product_count = db.scalar(
        select(func.count()).select_from(Product).where(Product.brand_id == brand_id)
    )
    if product_count and product_count > 0:
        raise AppError(
            f"Cannot delete brand while {product_count} product(s) still use it. "
            "Reassign or delete those products first.",
            code="brand_in_use",
            status_code=status.HTTP_409_CONFLICT,
        )
    db.delete(brand)
    db.commit()


def dashboard_stats(db: Session) -> dict:
    from app.domain.models.enums import INVOICE_LIST_STATUSES, InvoiceStatus, STAFF_ROLES
    from app.infrastructure.db.models import Invoice, User

    products = db.scalar(
        select(func.count()).select_from(Product).where(Product.status != ProductStatus.ARCHIVED.value)
    )
    categories = db.scalar(select(func.count()).select_from(Category))
    brands = db.scalar(select(func.count()).select_from(Brand))
    invoices = db.scalar(
        select(func.count())
        .select_from(Invoice)
        .where(Invoice.status.in_(INVOICE_LIST_STATUSES))
    )
    invoice_review = db.scalar(
        select(func.count())
        .select_from(Invoice)
        .where(Invoice.status == InvoiceStatus.PENDING_DELETE.value)
    )
    users = db.scalar(
        select(func.count()).select_from(User).where(User.role.in_(STAFF_ROLES))
    )
    return {
        "products": int(products or 0),
        "categories": int(categories or 0),
        "brands": int(brands or 0),
        "invoices": int(invoices or 0),
        "invoice_review": int(invoice_review or 0),
        "users": int(users or 0),
        "orders": 0,
        "customers": 0,
    }
