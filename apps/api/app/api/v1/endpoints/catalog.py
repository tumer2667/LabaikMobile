from fastapi import APIRouter, Query

from app.api.v1.deps import DbSession
from app.application.catalog import service as catalog
from app.schemas.catalog import (
    BrandResponse,
    CategoryResponse,
    ProductDetail,
    ProductListResponse,
)

router = APIRouter()


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: DbSession) -> list[CategoryResponse]:
    return catalog.list_categories(db, active_only=True)


@router.get("/categories/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: DbSession) -> CategoryResponse:
    return catalog.get_category_by_slug(db, slug)


@router.get("/brands", response_model=list[BrandResponse])
def get_brands(db: DbSession) -> list[BrandResponse]:
    return catalog.list_brands(db, active_only=True)


@router.get("/products", response_model=ProductListResponse)
def get_products(
    db: DbSession,
    category: str | None = None,
    brand: str | None = None,
    q: str | None = None,
    in_stock: bool | None = None,
    featured: bool | None = None,
    sort: str = Query(default="featured"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
) -> ProductListResponse:
    return catalog.list_products(
        db,
        category=category,
        brand=brand,
        q=q,
        in_stock=in_stock,
        featured=featured,
        sort=sort,
        page=page,
        page_size=page_size,
    )


@router.get("/products/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: DbSession) -> ProductDetail:
    return catalog.get_product_by_slug(db, slug)
