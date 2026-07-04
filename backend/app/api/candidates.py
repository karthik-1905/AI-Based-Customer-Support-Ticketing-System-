"""
Candidates routes - list, detail, update.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.candidate import Candidate
from app.models.parsed_resume import ParsedResume
from app.models.resume import Resume
from app.models.user import User
from app.schemas.candidate import CandidateDetail, CandidateProfile, CandidateUpdate

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("", response_model=list[CandidateProfile])
async def list_candidates(
    location: Optional[str] = Query(None),
    min_experience: Optional[float] = Query(None),
    max_experience: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """List candidates with optional filters (recruiters/hr/admin only)."""
    query = select(Candidate)

    if location:
        query = query.where(Candidate.location.ilike(f"%{location}%"))
    if min_experience is not None:
        query = query.where(Candidate.years_experience >= min_experience)
    if max_experience is not None:
        query = query.where(Candidate.years_experience <= max_experience)

    offset = (page - 1) * page_size
    result = await db.execute(query.offset(offset).limit(page_size))
    return result.scalars().all()


@router.get("/{candidate_id}", response_model=CandidateDetail)
async def get_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full candidate profile including parsed resume data."""
    result = await db.execute(
        select(Candidate)
        .options(
            selectinload(Candidate.user),
            selectinload(Candidate.resumes),
            selectinload(Candidate.parsed_resumes),
            selectinload(Candidate.applications),
        )
        .where(Candidate.id == candidate_id)
    )
    candidate = result.scalars().first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Access control: candidates can only view themselves
    if current_user.role == "candidate" and candidate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build detail response
    latest_resume = candidate.resumes[-1] if candidate.resumes else None
    latest_parsed = candidate.parsed_resumes[-1] if candidate.parsed_resumes else None

    return CandidateDetail(
        id=candidate.id,
        user_id=candidate.user_id,
        profile_photo=candidate.profile_photo,
        phone=candidate.phone,
        location=candidate.location,
        linkedin_url=candidate.linkedin_url,
        github_url=candidate.github_url,
        portfolio_url=candidate.portfolio_url,
        summary=candidate.summary,
        years_experience=candidate.years_experience,
        full_name=candidate.user.full_name if candidate.user else None,
        email=candidate.user.email if candidate.user else None,
        latest_resume={
            "id": latest_resume.id,
            "file_name": latest_resume.file_name,
            "file_url": latest_resume.file_url,
            "file_type": latest_resume.file_type,
        } if latest_resume else None,
        parsed_resume={
            "skills": latest_parsed.skills_list,
            "education": latest_parsed.education_list,
            "experience": latest_parsed.experience_list,
        } if latest_parsed else None,
        application_count=len(candidate.applications),
    )


@router.put("/{candidate_id}", response_model=CandidateProfile)
async def update_candidate(
    candidate_id: int,
    payload: CandidateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update candidate profile. Candidates can only update their own profile."""
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalars().first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if current_user.role == "candidate" and candidate.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot update another candidate's profile")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(candidate, field, value)

    await db.commit()
    await db.refresh(candidate)
    return candidate
