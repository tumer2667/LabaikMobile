"""Aggregate invoice finance KPIs and period reports for super admin."""

from __future__ import annotations

from collections import defaultdict
from datetime import UTC, date, datetime, timedelta

from fastapi import status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError
from app.domain.models.enums import INVOICE_LIST_STATUSES, PaymentMethod
from app.infrastructure.db.models import Invoice, InvoiceLine, InvoiceRefund
from app.schemas.finance import (
    FinanceKpis,
    FinancePaymentBreakdown,
    FinanceReport,
    FinanceSeriesPoint,
    FinanceTopProduct,
)

PAYMENT_LABELS: dict[str, str] = {
    PaymentMethod.CASH.value: "Cash",
    PaymentMethod.JAZZCASH.value: "JazzCash",
    PaymentMethod.EASYPAISA.value: "Easypaisa",
    PaymentMethod.BANK_TRANSFER.value: "Bank transfer",
    PaymentMethod.CARD.value: "Card",
    PaymentMethod.OTHER.value: "Other",
}

VALID_PERIODS = frozenset({"day", "week", "month", "year"})


def _as_utc_date(dt: datetime) -> date:
    if dt.tzinfo is None:
        return dt.date()
    return dt.astimezone(UTC).date()


def _parse_date(value: str | None, *, field: str) -> date | None:
    if value is None or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError as exc:
        raise AppError(
            f"Invalid {field}. Use YYYY-MM-DD.",
            code="invalid_date",
            status_code=status.HTTP_400_BAD_REQUEST,
        ) from exc


def _default_range(period: str, today: date) -> tuple[date, date]:
    """Simple ranges: today, this week, this month, this year."""
    if period == "day":
        return today, today
    if period == "week":
        start_of_week = today - timedelta(days=today.weekday())
        return start_of_week, today
    if period == "month":
        return today.replace(day=1), today
    return date(today.year, 1, 1), today


def _bucket_start(d: date, period: str) -> date:
    if period == "day":
        return d
    if period == "week":
        return d - timedelta(days=d.weekday())
    if period == "month":
        return d.replace(day=1)
    return d.replace(month=1, day=1)


def _next_bucket(start: date, period: str) -> date:
    if period == "day":
        return start + timedelta(days=1)
    if period == "week":
        return start + timedelta(weeks=1)
    if period == "month":
        year = start.year + (1 if start.month == 12 else 0)
        month = 1 if start.month == 12 else start.month + 1
        return date(year, month, 1)
    return date(start.year + 1, 1, 1)


def _label(start: date, period: str) -> str:
    if period == "day":
        return start.strftime("%b %d")
    if period == "week":
        end = start + timedelta(days=6)
        return f"{start.strftime('%b %d')}–{end.strftime('%b %d')}"
    if period == "month":
        return start.strftime("%b %Y")
    return start.strftime("%Y")


def _iter_buckets(from_date: date, to_date: date, period: str) -> list[date]:
    buckets: list[date] = []
    cursor = _bucket_start(from_date, period)
    last = _bucket_start(to_date, period)
    while cursor <= last:
        buckets.append(cursor)
        cursor = _next_bucket(cursor, period)
    return buckets


def _line_cost(line: InvoiceLine) -> int:
    return (line.unit_cost_pkr or 0) * line.quantity


def _invoices_query():
    return select(Invoice).options(
        selectinload(Invoice.lines),
        selectinload(Invoice.refunds),
    )


def _pct_change(current: float, previous: float) -> float | None:
    if previous == 0:
        return None if current == 0 else 100.0
    return round(((current - previous) / abs(previous)) * 100, 1)


def _build_kpis(
    invoices: list[Invoice],
    refunds: list[InvoiceRefund],
) -> FinanceKpis:
    total_sales = sum(inv.total_pkr for inv in invoices)
    total_orders = len(invoices)
    total_refunds = sum(r.amount_pkr for r in refunds)
    total_cogs = sum(_line_cost(line) for inv in invoices for line in inv.lines)
    total_revenue = total_sales - total_refunds
    total_profit = total_revenue - total_cogs
    avg_order = int(round(total_sales / total_orders)) if total_orders else 0
    refund_rate = round((total_refunds / total_sales) * 100, 2) if total_sales else 0.0
    margin = round((total_profit / total_revenue) * 100, 2) if total_revenue else 0.0
    return FinanceKpis(
        total_sales_pkr=total_sales,
        total_revenue_pkr=total_revenue,
        total_profit_pkr=total_profit,
        total_orders=total_orders,
        total_refunds_pkr=total_refunds,
        avg_order_value_pkr=avg_order,
        refund_rate_pct=refund_rate,
        margin_pct=margin,
    )


def _load_range(
    db: Session, start: date, end: date
) -> tuple[list[Invoice], list[InvoiceRefund]]:
    range_start = datetime(start.year, start.month, start.day, tzinfo=UTC)
    range_end = datetime(end.year, end.month, end.day, tzinfo=UTC) + timedelta(days=1)
    invoices = list(
        db.scalars(
            _invoices_query().where(
                Invoice.status.in_(INVOICE_LIST_STATUSES),
                Invoice.issued_at >= range_start,
                Invoice.issued_at < range_end,
            )
        )
    )
    refunds = list(
        db.scalars(
            select(InvoiceRefund).where(
                InvoiceRefund.created_at >= range_start,
                InvoiceRefund.created_at < range_end,
            )
        )
    )
    return invoices, refunds


def get_finance_report(
    db: Session,
    *,
    period: str = "month",
    from_date: str | None = None,
    to_date: str | None = None,
) -> FinanceReport:
    period_key = period.strip().lower()
    if period_key not in VALID_PERIODS:
        raise AppError(
            "period must be one of: day, week, month, year",
            code="invalid_period",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    today = datetime.now(UTC).date()
    start = _parse_date(from_date, field="from_date")
    end = _parse_date(to_date, field="to_date")
    if start is None or end is None:
        default_start, default_end = _default_range(period_key, today)
        start = start or default_start
        end = end or default_end
    if end < start:
        raise AppError(
            "to_date must be on or after from_date",
            code="invalid_date_range",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    invoices, refunds_in_range = _load_range(db, start, end)
    kpis = _build_kpis(invoices, refunds_in_range)

    # Previous equal-length window for trend deltas
    span_days = (end - start).days + 1
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=span_days - 1)
    prev_invoices, prev_refunds = _load_range(db, prev_start, prev_end)
    previous_kpis = _build_kpis(prev_invoices, prev_refunds)

    buckets = _iter_buckets(start, end, period_key)
    sales_by_bucket: dict[date, int] = defaultdict(int)
    orders_by_bucket: dict[date, int] = defaultdict(int)
    cogs_by_bucket: dict[date, int] = defaultdict(int)
    refunds_by_bucket: dict[date, int] = defaultdict(int)

    for inv in invoices:
        key = _bucket_start(_as_utc_date(inv.issued_at), period_key)
        sales_by_bucket[key] += inv.total_pkr
        orders_by_bucket[key] += 1
        cogs_by_bucket[key] += sum(_line_cost(line) for line in inv.lines)

    for refund in refunds_in_range:
        key = _bucket_start(_as_utc_date(refund.created_at), period_key)
        refunds_by_bucket[key] += refund.amount_pkr

    series: list[FinanceSeriesPoint] = []
    for bucket in buckets:
        sales = sales_by_bucket.get(bucket, 0)
        refunds = refunds_by_bucket.get(bucket, 0)
        revenue = sales - refunds
        profit = revenue - cogs_by_bucket.get(bucket, 0)
        series.append(
            FinanceSeriesPoint(
                label=_label(bucket, period_key),
                period_start=bucket,
                sales_pkr=sales,
                revenue_pkr=revenue,
                profit_pkr=profit,
                orders=orders_by_bucket.get(bucket, 0),
                refunds_pkr=refunds,
            )
        )

    product_qty: dict[str, int] = defaultdict(int)
    product_sales: dict[str, int] = defaultdict(int)
    product_profit: dict[str, int] = defaultdict(int)
    product_name: dict[str, str] = {}
    product_id_map: dict[str, str | None] = {}

    for inv in invoices:
        for line in inv.lines:
            key = str(line.product_id) if line.product_id else f"desc:{line.description}"
            product_qty[key] += line.quantity
            product_sales[key] += line.line_total_pkr
            product_profit[key] += line.line_total_pkr - _line_cost(line)
            product_name[key] = line.description
            product_id_map[key] = str(line.product_id) if line.product_id else None

    top_products = sorted(
        [
            FinanceTopProduct(
                product_id=product_id_map[key],
                name=product_name[key],
                quantity_sold=product_qty[key],
                sales_pkr=product_sales[key],
                profit_pkr=product_profit[key],
            )
            for key in product_qty
        ],
        key=lambda p: (p.quantity_sold, p.sales_pkr),
        reverse=True,
    )[:10]

    pay_orders: dict[str, int] = defaultdict(int)
    pay_sales: dict[str, int] = defaultdict(int)
    for inv in invoices:
        method = (inv.payment_method or "cash").lower()
        pay_orders[method] += 1
        pay_sales[method] += inv.total_pkr

    payment_methods: list[FinancePaymentBreakdown] = []
    for method, sales in sorted(pay_sales.items(), key=lambda x: x[1], reverse=True):
        payment_methods.append(
            FinancePaymentBreakdown(
                method=method,
                label=PAYMENT_LABELS.get(method, method.replace("_", " ").title()),
                orders=pay_orders[method],
                sales_pkr=sales,
                pct=round((sales / kpis.total_sales_pkr) * 100, 2)
                if kpis.total_sales_pkr
                else 0.0,
            )
        )

    return FinanceReport(
        period=period_key,
        from_date=start,
        to_date=end,
        previous_from_date=prev_start,
        previous_to_date=prev_end,
        kpis=kpis,
        previous_kpis=previous_kpis,
        changes={
            "sales_pct": _pct_change(kpis.total_sales_pkr, previous_kpis.total_sales_pkr),
            "revenue_pct": _pct_change(
                kpis.total_revenue_pkr, previous_kpis.total_revenue_pkr
            ),
            "profit_pct": _pct_change(
                kpis.total_profit_pkr, previous_kpis.total_profit_pkr
            ),
            "orders_pct": _pct_change(kpis.total_orders, previous_kpis.total_orders),
            "refunds_pct": _pct_change(
                kpis.total_refunds_pkr, previous_kpis.total_refunds_pkr
            ),
        },
        series=series,
        top_products=top_products,
        payment_methods=payment_methods,
        notes=[
            "Sales = gross invoice totals issued in the selected range.",
            "Revenue = sales − refunds recorded in the range.",
            "Profit = revenue − cost of goods (product cost × qty) on those invoices.",
            "Trends compare against the previous equal-length date range.",
            "Set cost on products to improve profit accuracy.",
        ],
    )
