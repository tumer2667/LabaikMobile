from fastapi import APIRouter, Query

from app.api.v1.deps import DbSession, SuperAdminUser
from app.application.finance import service as finance
from app.schemas.finance import FinanceReport

router = APIRouter(prefix="/admin/finance")


@router.get("/report", response_model=FinanceReport)
def finance_report(
    _super: SuperAdminUser,
    db: DbSession,
    period: str = Query(default="month", pattern="^(day|week|month|year)$"),
    from_date: str | None = Query(default=None, description="YYYY-MM-DD"),
    to_date: str | None = Query(default=None, description="YYYY-MM-DD"),
) -> FinanceReport:
    return finance.get_finance_report(
        db,
        period=period,
        from_date=from_date,
        to_date=to_date,
    )
