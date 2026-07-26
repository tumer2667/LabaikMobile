"""add longer media url columns

Revision ID: 20260727_0008
Revises: 20260726_0007
Create Date: 2026-07-27
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260727_0008"
down_revision: str | None = "20260726_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("categories") as batch_op:
        batch_op.alter_column(
            "image_url",
            existing_type=sa.String(length=500),
            type_=sa.String(length=2000),
            existing_nullable=True,
        )
    with op.batch_alter_table("product_images") as batch_op:
        batch_op.alter_column(
            "url",
            existing_type=sa.String(length=500),
            type_=sa.String(length=2000),
            existing_nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("product_images") as batch_op:
        batch_op.alter_column(
            "url",
            existing_type=sa.String(length=2000),
            type_=sa.String(length=500),
            existing_nullable=False,
        )
    with op.batch_alter_table("categories") as batch_op:
        batch_op.alter_column(
            "image_url",
            existing_type=sa.String(length=2000),
            type_=sa.String(length=500),
            existing_nullable=True,
        )
