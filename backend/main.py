"""
RecruitAI - Main FastAPI Application Entry Point
Configures middleware, routers, startup events, and error handlers.
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.database import engine, Base
from app.api.router import api_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("recruitai")


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables and upload directory on startup."""
    logger.info("Starting RecruitAI backend…")

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory ready: {settings.UPLOAD_DIR}")

    # Create all tables (development convenience; use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialised.")

    yield

    logger.info("Shutting down RecruitAI backend.")
    await engine.dispose()


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="RecruitAI API",
    description="AI-powered recruitment platform backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files (uploaded resumes, logos, etc.)
# ---------------------------------------------------------------------------
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Global error handlers
# ---------------------------------------------------------------------------
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found", "path": str(request.url)},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health-check endpoint for load-balancers and monitoring."""
    return {"status": "ok", "service": "RecruitAI API", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Frontend static files mounting & catch-all routing
# ---------------------------------------------------------------------------
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    # Mount the /assets static folder
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    # Catch-all route to serve the React index.html and root-level static files
    @app.get("/{catchall:path}", tags=["Frontend"])
    async def serve_react_app(catchall: str):
        # Prevent intercepting system paths if they somehow leak through
        if catchall.startswith(("api/", "docs", "redoc", "openapi.json", "uploads/", "health")):
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": "Resource not found"})

        file_path = os.path.join(frontend_dist, catchall)
        if catchall and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": "Frontend build files not found."})
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Welcome to RecruitAI API (Frontend build files not found)",
            "docs": "/docs",
            "health": "/health",
        }
