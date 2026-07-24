from fastapi import APIRouter, Request, status

from app.api.v1.deps import AdminUser, CurrentUser, DbSession
from app.application.identity import auth_service
from app.core.exceptions import AppError
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth")


def _user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")


@router.post("/register", response_model=AuthResponse, status_code=201, include_in_schema=False)
def register(_payload: RegisterRequest, request: Request, db: DbSession) -> AuthResponse:
    raise AppError(
        "Public registration is disabled. The storefront is public; use the admin portal to sign in.",
        code="registration_disabled",
        status_code=status.HTTP_403_FORBIDDEN,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, request: Request, db: DbSession) -> AuthResponse:
    """Generic login kept for tooling; admin portal should use /auth/admin/login."""
    return auth_service.login_user(db, payload, user_agent=_user_agent(request))


@router.post("/admin/login", response_model=AuthResponse)
def admin_login(payload: LoginRequest, request: Request, db: DbSession) -> AuthResponse:
    return auth_service.login_admin(db, payload, user_agent=_user_agent(request))


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, request: Request, db: DbSession) -> TokenResponse:
    return auth_service.refresh_tokens(
        db, payload.refresh_token, user_agent=_user_agent(request)
    )


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LogoutRequest, db: DbSession) -> MessageResponse:
    auth_service.logout_user(db, payload.refresh_token)
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserResponse)
def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.get("/admin/me", response_model=UserResponse)
def admin_me(admin_user: AdminUser) -> UserResponse:
    return UserResponse.model_validate(admin_user)
