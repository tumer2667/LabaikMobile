from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, catalog, health, uploads

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth.router, tags=["auth"])
api_v1_router.include_router(catalog.router, tags=["catalog"])
api_v1_router.include_router(admin.router, tags=["admin"])
api_v1_router.include_router(uploads.router, tags=["admin"])
