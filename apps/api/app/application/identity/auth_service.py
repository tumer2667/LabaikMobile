from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from fastapi import status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    refresh_expiry,
    verify_password,
)
from app.domain.models.enums import UserRole, UserStatus
from app.infrastructure.db.models import RefreshToken, User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

settings = get_settings()


def _to_user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def _issue_tokens(db: Session, user: User, *, user_agent: str | None = None) -> TokenResponse:
    access = create_access_token(subject=user.id, role=user.role)
    raw_refresh = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=refresh_expiry(),
            user_agent=user_agent,
        )
    )
    db.commit()
    return TokenResponse(
        access_token=access,
        refresh_token=raw_refresh,
        expires_in=settings.access_token_expire_minutes * 60,
    )


def register_user(
    db: Session, payload: RegisterRequest, *, user_agent: str | None = None
) -> AuthResponse:
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
        phone=payload.phone.strip() if payload.phone else None,
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    tokens = _issue_tokens(db, user, user_agent=user_agent)
    return AuthResponse(user=_to_user_response(user), tokens=tokens)


def login_user(
    db: Session, payload: LoginRequest, *, user_agent: str | None = None
) -> AuthResponse:
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError(
            "Invalid email or password",
            code="invalid_credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    if user.status != UserStatus.ACTIVE.value:
        raise AppError(
            "Account is disabled",
            code="account_disabled",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    tokens = _issue_tokens(db, user, user_agent=user_agent)
    return AuthResponse(user=_to_user_response(user), tokens=tokens)


def login_admin(
    db: Session, payload: LoginRequest, *, user_agent: str | None = None
) -> AuthResponse:
    """Admin portal login — only admin / sub_admin roles."""
    result = login_user(db, payload, user_agent=user_agent)
    if result.user.role not in {UserRole.ADMIN.value, UserRole.SUB_ADMIN.value}:
        # Revoke the refresh we just issued
        logout_user(db, result.tokens.refresh_token)
        raise AppError(
            "Admin access required",
            code="admin_required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return result


def refresh_tokens(
    db: Session, raw_refresh: str, *, user_agent: str | None = None
) -> TokenResponse:
    token_hash = hash_token(raw_refresh)
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    now = datetime.now(UTC)

    if stored is None or stored.revoked_at is not None:
        raise AppError(
            "Invalid refresh token",
            code="invalid_refresh_token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    expires_at = stored.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at <= now:
        raise AppError(
            "Refresh token expired",
            code="refresh_token_expired",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = db.get(User, stored.user_id)
    if user is None or user.status != UserStatus.ACTIVE.value:
        raise AppError(
            "Account unavailable",
            code="account_unavailable",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Rotate refresh token
    stored.revoked_at = now
    db.add(stored)
    db.commit()
    return _issue_tokens(db, user, user_agent=user_agent)


def logout_user(db: Session, raw_refresh: str) -> None:
    token_hash = hash_token(raw_refresh)
    stored = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    if stored and stored.revoked_at is None:
        stored.revoked_at = datetime.now(UTC)
        db.add(stored)
        db.commit()


def get_user_by_id(db: Session, user_id: UUID) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise AppError(
            "User not found",
            code="user_not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return user
