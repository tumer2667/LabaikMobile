from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.domain.models.enums import UserRole, UserStatus
from app.infrastructure.db.models import User

logger = get_logger(__name__)


def ensure_admin_user(db: Session, settings: Settings) -> None:
    email = settings.admin_email.lower().strip()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        if existing.role != UserRole.ADMIN.value:
            existing.role = UserRole.ADMIN.value
            existing.status = UserStatus.ACTIVE.value
            db.add(existing)
            db.commit()
            logger.info("admin_role_ensured", extra={"email": email})
        return

    admin = User(
        email=email,
        password_hash=hash_password(settings.admin_password),
        full_name=settings.admin_full_name,
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add(admin)
    db.commit()
    logger.info("admin_user_seeded", extra={"email": email})
