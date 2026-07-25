"""Super-admin management of admin (sub-admin) users."""

from __future__ import annotations

from uuid import UUID

from fastapi import status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.core.security import hash_password
from app.domain.models.enums import STAFF_ROLES, UserRole, UserStatus
from app.infrastructure.db.models import RefreshToken, User
from app.schemas.auth import AdminUserCreate, UserResponse


def list_staff_users(db: Session) -> list[UserResponse]:
    users = db.scalars(
        select(User)
        .where(User.role.in_(STAFF_ROLES))
        .order_by(User.created_at.asc())
    ).all()
    return [UserResponse.model_validate(u) for u in users]


def create_admin_user(db: Session, payload: AdminUserCreate) -> UserResponse:
    email = payload.email.lower().strip()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise AppError(
            "An account with this email already exists",
            code="email_taken",
            status_code=status.HTTP_409_CONFLICT,
        )

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


def delete_admin_user(db: Session, user_id: UUID, *, actor: User) -> None:
    if actor.id == user_id:
        raise AppError(
            "You cannot delete your own account",
            code="cannot_delete_self",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user = db.get(User, user_id)
    if user is None or user.role not in STAFF_ROLES:
        raise AppError(
            "Admin user not found",
            code="admin_user_not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    if user.role == UserRole.SUPER_ADMIN.value:
        raise AppError(
            "Super admin accounts cannot be deleted here",
            code="cannot_delete_super_admin",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    # Revoke refresh tokens, then delete user
    tokens = db.scalars(select(RefreshToken).where(RefreshToken.user_id == user.id)).all()
    for token in tokens:
        db.delete(token)
    db.delete(user)
    db.commit()
