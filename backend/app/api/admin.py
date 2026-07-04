"""
Admin routes - user management and system stats.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.company import Company
from app.models.job import Job
from app.models.recruiter import Recruiter
from app.models.user import User
from app.schemas.auth import UserResponse, UserUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """List all registered users (admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Update user metadata (activate/deactivate, change role, verify)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.get("/stats")
async def system_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Return system-wide aggregate statistics."""
    users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    companies = (await db.execute(select(func.count(Company.id)))).scalar() or 0
    jobs = (await db.execute(select(func.count(Job.id)))).scalar() or 0
    applications = (await db.execute(select(func.count(Application.id)))).scalar() or 0
    candidates = (await db.execute(select(func.count(Candidate.id)))).scalar() or 0
    recruiters = (await db.execute(select(func.count(Recruiter.id)))).scalar() or 0

    return {
        "total_users": users,
        "total_companies": companies,
        "total_jobs": jobs,
        "total_applications": applications,
        "total_candidates": candidates,
        "total_recruiters": recruiters,
    }
