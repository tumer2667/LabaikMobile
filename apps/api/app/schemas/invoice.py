from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class InvoiceLineCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1, le=10_000)
    unit_price_pkr: int | None = Field(default=None, ge=0)


class InvoiceCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=160)
    customer_phone: str | None = Field(default=None, max_length=32)
    customer_email: EmailStr | None = None
    notes: str = Field(default="", max_length=2000)
    discount_pkr: int = Field(default=0, ge=0)
    payment_method: str = Field(default="cash", max_length=32)
    lines: list[InvoiceLineCreate] = Field(min_length=1)


class RefundCreate(BaseModel):
    amount_pkr: int = Field(ge=1)
    reason: str = Field(default="", max_length=2000)


class InvoiceLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID | None
    description: str
    quantity: int
    unit_price_pkr: int
    unit_cost_pkr: int = 0
    line_total_pkr: int
    sort_order: int


class RefundResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    number: str
    invoice_id: UUID
    invoice_number: str
    amount_pkr: int
    reason: str
    status: str
    created_by_id: UUID | None
    created_by_name: str | None = None
    created_at: datetime


class InvoiceCreatorOption(BaseModel):
    id: UUID
    full_name: str


class InvoiceListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    number: str
    status: str
    customer_name: str
    customer_phone: str | None
    subtotal_pkr: int
    discount_pkr: int
    total_pkr: int
    refunded_pkr: int = 0
    remaining_pkr: int = 0
    payment_method: str = "cash"
    issued_at: datetime
    created_at: datetime
    line_count: int = 0
    created_by_id: UUID | None = None
    created_by_name: str | None = None


class InvoiceDetail(InvoiceListItem):
    customer_email: str | None
    notes: str
    lines: list[InvoiceLineResponse]
    refunds: list[RefundResponse] = Field(default_factory=list)
