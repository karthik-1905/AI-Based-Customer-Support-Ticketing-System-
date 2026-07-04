"""
Interviews routes - schedule, list, update, cancel.
"""
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.application import Application
from app.models.interview import Interview
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewResponse, InterviewUpdate

router = APIRouter(prefix="/interviews", tags=["Interviews"])


def _interview_to_response(iv: Interview) -> InterviewResponse:
    return InterviewResponse(
        id=iv.id,
        application_id=iv.application_id,
        scheduled_at=iv.scheduled_at,
        duration_minutes=iv.duration_minutes,
        mode=iv.mode,
        meeting_link=iv.meeting_link,
        panel=iv.panel_list,
        notes=iv.notes,
        status=iv.status,
        created_at=iv.created_at,
    )


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    payload: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Schedule an interview for an application."""
    # Verify application exists
    result = await db.execute(select(Application).where(Application.id == payload.application_id))
    application = result.scalars().first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = Interview(
        application_id=payload.application_id,
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes,
        mode=payload.mode,
        meeting_link=payload.meeting_link,
        notes=payload.notes,
    )
    interview.panel_list = payload.panel or []
    db.add(interview)
    await db.commit()
    await db.refresh(interview)
    return _interview_to_response(interview)


@router.get("", response_model=list[InterviewResponse])
async def list_interviews(
    application_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List interviews. Filter by application_id."""
    query = select(Interview)
    if application_id:
        query = query.where(Interview.application_id == application_id)
    query = query.order_by(Interview.scheduled_at)
    result = await db.execute(query)
    return [_interview_to_response(iv) for iv in result.scalars().all()]


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single interview."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    iv = result.scalars().first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
    return _interview_to_response(iv)


@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: int,
    payload: InterviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Update interview details."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    iv = result.scalars().first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = payload.model_dump(exclude_none=True)
    if "panel" in update_data:
        iv.panel_list = update_data.pop("panel")
    for field, value in update_data.items():
        setattr(iv, field, value)

    await db.commit()
    await db.refresh(iv)
    return _interview_to_response(iv)


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Cancel/delete an interview."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    iv = result.scalars().first()
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
    await db.delete(iv)
    await db.commit()
