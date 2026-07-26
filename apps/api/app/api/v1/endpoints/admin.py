from uuid import UUID

from fastapi import APIRouter, Query

from app.api.v1.deps import AdminUser, DbSession, SuperAdminUser
from app.application.catalog import service as catalog
from app.application.dashboard import service as dashboard
from app.application.identity import admin_users
from app.schemas.auth import AdminUserCreate, UserResponse
from app.schemas.catalog import (
    BrandCreate,
    BrandResponse,
    BrandUpdate,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    ProductCreate,
    ProductDetail,
    ProductListResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/admin")


@router.get("/dashboard")
def admin_dashboard(_admin: AdminUser, db: DbSession) -> dict:
    return dashboard.build_dashboard(db)


@router.get("/session", response_model=UserResponse)
def session(admin: AdminUser) -> UserResponse:
    return UserResponse.model_validate(admin)


@router.get("/users", response_model=list[UserResponse])
def list_users(_super: SuperAdminUser, db: DbSession) -> list[UserResponse]:
    return admin_users.list_staff_users(db)


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    payload: AdminUserCreate, _super: SuperAdminUser, db: DbSession
) -> UserResponse:
    return admin_users.create_admin_user(db, payload)


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: UUID, super_admin: SuperAdminUser, db: DbSession) -> None:
    admin_users.delete_admin_user(db, user_id, actor=super_admin)


@router.get("/categories", response_model=list[CategoryResponse])
def admin_categories(_admin: AdminUser, db: DbSession) -> list[CategoryResponse]:
    return catalog.list_categories(db, active_only=False)


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(
    payload: CategoryCreate, _admin: AdminUser, db: DbSession
) -> CategoryResponse:
    return catalog.create_category(db, payload)


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: UUID, payload: CategoryUpdate, _admin: AdminUser, db: DbSession
) -> CategoryResponse:
    return catalog.update_category(db, category_id, payload)


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: UUID, _admin: AdminUser, db: DbSession) -> None:
    catalog.delete_category(db, category_id)


@router.get("/brands", response_model=list[BrandResponse])
def admin_brands(_admin: AdminUser, db: DbSession) -> list[BrandResponse]:
    return catalog.list_brands(db, active_only=False)


@router.post("/brands", response_model=BrandResponse, status_code=201)
def create_brand(payload: BrandCreate, _admin: AdminUser, db: DbSession) -> BrandResponse:
    return catalog.create_brand(db, payload)


@router.patch("/brands/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: UUID, payload: BrandUpdate, _admin: AdminUser, db: DbSession
) -> BrandResponse:
    return catalog.update_brand(db, brand_id, payload)


@router.delete("/brands/{brand_id}", status_code=204)
def delete_brand(brand_id: UUID, _admin: AdminUser, db: DbSession) -> None:
    catalog.delete_brand(db, brand_id)


@router.get("/products", response_model=ProductListResponse)
def admin_products(
    _admin: AdminUser,
    db: DbSession,
    category: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
) -> ProductListResponse:
    return catalog.list_products(
        db,
        category=category,
        q=q,
        page=page,
        page_size=page_size,
        include_inactive=True,
        sort="newest",
    )


@router.post("/products", response_model=ProductDetail, status_code=201)
def create_product(payload: ProductCreate, _admin: AdminUser, db: DbSession) -> ProductDetail:
    return catalog.create_product(db, payload)


@router.get("/products/id/{product_id}", response_model=ProductDetail)
def get_admin_product(product_id: UUID, _admin: AdminUser, db: DbSession) -> ProductDetail:
    return catalog.get_product_by_id_detail(db, product_id)


@router.patch("/products/{product_id}", response_model=ProductDetail)
def update_product(
    product_id: UUID, payload: ProductUpdate, _admin: AdminUser, db: DbSession
) -> ProductDetail:
    return catalog.update_product(db, product_id, payload)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: UUID, _admin: AdminUser, db: DbSession) -> None:
    catalog.delete_product(db, product_id)
