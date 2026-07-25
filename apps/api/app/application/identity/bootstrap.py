from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.domain.models.enums import UserRole, UserStatus
from app.infrastructure.db.models import User

logger = get_logger(__name__)


def _migrate_legacy_roles(db: Session) -> None:
    """Map legacy sub_admin → admin (sub-admin role)."""
    changed = False
    for user in db.scalars(select(User).where(User.role == "sub_admin")).all():
        user.role = UserRole.ADMIN.value
        db.add(user)
        changed = True
    if changed:
        db.commit()
        logger.info("legacy_sub_admin_roles_migrated")


def ensure_admin_user(db: Session, settings: Settings) -> None:
    email = settings.admin_email.lower().strip()
    _migrate_legacy_roles(db)

    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        touched = False
        if existing.role != UserRole.SUPER_ADMIN.value:
            existing.role = UserRole.SUPER_ADMIN.value
            touched = True
        if existing.status != UserStatus.ACTIVE.value:
            existing.status = UserStatus.ACTIVE.value
            touched = True
        if touched:
            db.add(existing)
            db.commit()
            logger.info("super_admin_role_ensured", extra={"email": email})
        return

    admin = User(
        email=email,
        password_hash=hash_password(settings.admin_password),
        full_name=settings.admin_full_name,
        role=UserRole.SUPER_ADMIN.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add(admin)
    db.commit()
    logger.info("super_admin_user_seeded", extra={"email": email})
