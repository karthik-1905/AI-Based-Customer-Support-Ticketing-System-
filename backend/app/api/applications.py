"""
Applications routes - apply, list, stage transitions.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.application import Application, ApplicationStage
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, StageUpdate
from app.services.application_service import create_application, update_stage
from app.services.notification_service import create_notification

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    """Apply to a job. One application per job per candidate."""
    application = await create_application(db, current_user, payload)
    return application


@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    job_id: Optional[int] = Query(None),
    candidate_id: Optional[int] = Query(None),
    stage: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List applications.
    - Candidates see only their own applications.
    - Recruiters/HR/Admin can filter by job_id or candidate_id.
    """
    query = select(Application).options(
        selectinload(Application.job),
        selectinload(Application.candidate),
    )

    if current_user.role == "candidate":
        # Find this user's candidate profile
        result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
        cand = result.scalars().first()
        if not cand:
            return []
        query = query.where(Application.candidate_id == cand.id)
    else:
        if job_id:
            query = query.where(Application.job_id == job_id)
        if candidate_id:
            query = query.where(Application.candidate_id == candidate_id)

    if stage:
        query = query.where(Application.stage == stage)

    result = await db.execute(query.order_by(Application.applied_at.desc()))
    return result.scalars().all()


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single application."""
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.job), selectinload(Application.candidate))
        .where(Application.id == application_id)
    )
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.put("/{application_id}/stage", response_model=ApplicationResponse)
async def move_stage(
    application_id: int,
    payload: StageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Move an application through the hiring pipeline."""
    application = await update_stage(db, application_id, payload.stage, current_user)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Withdraw/delete an application.
    Candidates can only delete their own; recruiters/admin can delete any.
    """
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == "candidate":
        cand_result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
        cand = cand_result.scalars().first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this application")

    await db.delete(app)
    await db.commit()
