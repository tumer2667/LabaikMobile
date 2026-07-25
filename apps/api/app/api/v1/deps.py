from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.application.identity import auth_service
from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.domain.models.enums import STAFF_ROLES, UserRole, UserStatus
from app.infrastructure.db.models import User
from app.infrastructure.db.session import get_db

bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError(
            "Not authenticated",
            code="not_authenticated",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = UUID(str(payload["sub"]))
    except (ValueError, KeyError) as exc:
        raise AppError(
            "Invalid or expired access token",
            code="invalid_access_token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user = auth_service.get_user_by_id(db, user_id)
    if user.status != UserStatus.ACTIVE.value:
        raise AppError(
            "Account is disabled",
            code="account_disabled",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(user: CurrentUser) -> User:
    if user.role not in STAFF_ROLES:
        raise AppError(
            "Admin access required",
            code="admin_required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return user


def require_super_admin(user: CurrentUser) -> User:
    if user.role != UserRole.SUPER_ADMIN.value:
        raise AppError(
            "Super admin access required",
            code="super_admin_required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return user


AdminUser = Annotated[User, Depends(require_admin)]
SuperAdminUser = Annotated[User, Depends(require_super_admin)]
