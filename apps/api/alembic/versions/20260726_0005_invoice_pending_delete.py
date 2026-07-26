"""migrate void invoices to pending_delete

Revision ID: 20260726_0005
Revises: 20260726_0004
Create Date: 2026-07-26
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260726_0005"
down_revision: str | None = "20260726_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        sa.text("UPDATE invoices SET status = 'pending_delete' WHERE status = 'void'")
    )


def downgrade() -> None:
    op.execute(
        sa.text("UPDATE invoices SET status = 'void' WHERE status = 'pending_delete'")
    )
