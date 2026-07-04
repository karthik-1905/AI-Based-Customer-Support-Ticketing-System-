"""
Master API router - includes all sub-routers.
"""
from fastapi import APIRouter

from app.api import (
    admin,
    analytics,
    applications,
    auth,
    candidates,
    interviews,
    jobs,
    matching,
    notifications,
    resumes,
)

api_router = APIRouter()

# Auth (public endpoints)
api_router.include_router(auth.router)

# Core resources
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
api_router.include_router(resumes.router)
api_router.include_router(candidates.router)
api_router.include_router(interviews.router)
api_router.include_router(notifications.router)

# Analytics & AI
api_router.include_router(analytics.router)
api_router.include_router(matching.router)

# Admin
api_router.include_router(admin.router)
