from fastapi import APIRouter, File, Form, UploadFile

from app.api.v1.deps import AdminUser
from app.infrastructure.storage.uploads import upload_image

router = APIRouter(prefix="/admin")


@router.post("/uploads")
async def upload_media(
    _admin: AdminUser,
    file: UploadFile = File(...),
    folder: str = Form(default="products"),
) -> dict[str, str]:
    """Upload an image and return a public URL for catalog use."""
    safe_folder = folder if folder in {"products", "categories"} else "products"
    return await upload_image(file, folder=safe_folder)
