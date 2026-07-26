from datetime import date

from pydantic import BaseModel, Field


class FinanceKpis(BaseModel):
    total_sales_pkr: int
    total_revenue_pkr: int
    total_profit_pkr: int
    total_orders: int
    total_refunds_pkr: int
    avg_order_value_pkr: int
    refund_rate_pct: float
    margin_pct: float = 0


class FinanceSeriesPoint(BaseModel):
    label: str
    period_start: date
    sales_pkr: int
    revenue_pkr: int
    profit_pkr: int
    orders: int
    refunds_pkr: int


class FinanceTopProduct(BaseModel):
    product_id: str | None
    name: str
    quantity_sold: int
    sales_pkr: int
    profit_pkr: int


class FinancePaymentBreakdown(BaseModel):
    method: str
    label: str
    orders: int
    sales_pkr: int
    pct: float


class FinanceReport(BaseModel):
    period: str
    from_date: date
    to_date: date
    previous_from_date: date | None = None
    previous_to_date: date | None = None
    kpis: FinanceKpis
    previous_kpis: FinanceKpis | None = None
    changes: dict[str, float | None] = Field(default_factory=dict)
    series: list[FinanceSeriesPoint]
    top_products: list[FinanceTopProduct]
    payment_methods: list[FinancePaymentBreakdown]
    notes: list[str] = Field(default_factory=list)
