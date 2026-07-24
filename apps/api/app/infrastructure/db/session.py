from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings, normalize_database_url


class Base(DeclarativeBase):
    pass


settings = get_settings()
database_url = normalize_database_url(settings.database_url)

# Supabase requires SSL from external hosts (Render).
if database_url.startswith("postgresql") and "sslmode=" not in database_url:
    database_url = (
        f"{database_url}&sslmode=require"
        if "?" in database_url
        else f"{database_url}?sslmode=require"
    )

_connect_args: dict = {}
_engine_kwargs: dict = {
    "pool_pre_ping": True,
}

if database_url.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}
else:
    _engine_kwargs["pool_size"] = 5
    _engine_kwargs["max_overflow"] = 5

engine = create_engine(
    database_url,
    connect_args=_connect_args,
    **_engine_kwargs,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
