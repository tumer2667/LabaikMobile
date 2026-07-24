"""Upload product/category images to Supabase Storage (or local disk in development)."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

import httpx
from fastapi import UploadFile, status

from app.core.config import Settings, get_settings
from app.core.exceptions import AppError

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


def _safe_stem(name: str) -> str:
    stem = Path(name).stem.lower()
    cleaned = re.sub(r"[^a-z0-9_-]+", "-", stem).strip("-")
    return cleaned[:40] or "image"


async def upload_image(file: UploadFile, *, folder: str = "products") -> dict[str, str]:
    settings = get_settings()
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise AppError(
            "Only JPG, PNG, WEBP, or GIF images are allowed.",
            code="invalid_image_type",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    data = await file.read()
    if not data:
        raise AppError("Empty file.", code="empty_file", status_code=status.HTTP_400_BAD_REQUEST)
    if len(data) > MAX_BYTES:
        raise AppError(
            "Image is too large. Max size is 5 MB.",
            code="image_too_large",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    ext = ALLOWED_CONTENT_TYPES[content_type]
    filename = f"{_safe_stem(file.filename or 'image')}-{uuid.uuid4().hex[:10]}{ext}"
    object_path = f"{folder.strip('/')}/{filename}"

    if settings.supabase_url and settings.supabase_service_role_key:
        return await _upload_supabase(settings, object_path, data, content_type)

    if settings.is_development:
        return _upload_local(object_path, data)

    raise AppError(
        "Image upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the API.",
        code="storage_not_configured",
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


async def _upload_supabase(
    settings: Settings,
    object_path: str,
    data: bytes,
    content_type: str,
) -> dict[str, str]:
    base = settings.supabase_url.rstrip("/")
    bucket = settings.supabase_storage_bucket
    upload_url = f"{base}/storage/v1/object/{bucket}/{object_path}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key or "",
        "Content-Type": content_type,
        "x-upsert": "true",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(upload_url, content=data, headers=headers)

    if response.status_code >= 400:
        raise AppError(
            "Failed to upload image to storage.",
            code="storage_upload_failed",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=response.text[:500],
        )

    public_url = f"{base}/storage/v1/object/public/{bucket}/{object_path}"
    return {"url": public_url, "path": object_path}


def _upload_local(object_path: str, data: bytes) -> dict[str, str]:
    root = Path(__file__).resolve().parents[3] / "uploads"
    target = root / object_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    return {"url": f"/uploads/{object_path}", "path": object_path}
