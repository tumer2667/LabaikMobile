from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BrandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    is_active: bool


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str
    image_url: str | None
    show_price: bool
    sort_order: int
    is_active: bool
    product_count: int = 0


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    url: str
    sort_order: int
    is_primary: bool


class ProductListItem(BaseModel):
    id: UUID
    name: str
    slug: str
    brand_id: UUID
    brand: str
    brand_slug: str
    category_id: UUID
    category_slug: str
    category_name: str
    show_price: bool
    price_pkr: int
    compare_at_pkr: int | None
    rating: float
    review_count: int
    in_stock: bool
    is_featured: bool
    is_new: bool
    short_description: str
    primary_image: str | None
    images: list[str]


class ProductDetail(ProductListItem):
    description: str
    colors: list[str]
    highlights: list[str]
    status: str
    created_at: datetime
    cost_pkr: int = 0


class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    meta: dict[str, int]


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: str | None = Field(default=None, max_length=140)
    description: str = ""
    image_url: str | None = Field(default=None, max_length=2000)
    show_price: bool = True
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = Field(default=None, max_length=140)
    description: str | None = None
    image_url: str | None = Field(default=None, max_length=2000)
    show_price: bool | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str | None = Field(default=None, max_length=140)
    is_active: bool = True


class BrandUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = None
    is_active: bool | None = None


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str | None = None
    brand_id: UUID
    category_id: UUID
    short_description: str = Field(default="", max_length=300)
    description: str = ""
    price_pkr: int = Field(ge=0)
    compare_at_pkr: int | None = Field(default=None, ge=0)
    cost_pkr: int = Field(default=0, ge=0)
    show_price: bool = True
    status: str = "active"
    in_stock: bool = True
    is_featured: bool = False
    is_new: bool = False
    rating: float = Field(default=0, ge=0, le=5)
    review_count: int = Field(default=0, ge=0)
    colors: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    image_urls: list[str] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = None
    brand_id: UUID | None = None
    category_id: UUID | None = None
    short_description: str | None = Field(default=None, max_length=300)
    description: str | None = None
    price_pkr: int | None = Field(default=None, ge=0)
    compare_at_pkr: int | None = Field(default=None, ge=0)
    cost_pkr: int | None = Field(default=None, ge=0)
    show_price: bool | None = None
    status: str | None = None
    in_stock: bool | None = None
    is_featured: bool | None = None
    is_new: bool | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)
    colors: list[str] | None = None
    highlights: list[str] | None = None
    image_urls: list[str] | None = None
