# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.config import settings, db_manager
from app.routes import submit, stats, export, health

# Create FastAPI app
app = FastAPI(title="Math Handwriting API")


def parse_cors_origins(raw: str | None) -> list[str]:
    """Parse CORS origins from comma-separated string"""
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


# Configure CORS middleware
cors_origins = parse_cors_origins(settings.CORS_ALLOW_ORIGINS)
cors_origin_regex = settings.CORS_ALLOW_ORIGIN_REGEX

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(submit.router)
app.include_router(stats.router)
app.include_router(export.router)
app.include_router(health.router)


@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await db_manager.startup()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.UVICORN_RELOAD
    )
