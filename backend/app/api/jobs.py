"""
Jobs routes - CRUD + publish/close actions with pagination, search, filters.
"""
import json
import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.job import Job, JobStatus
from app.models.recruiter import Recruiter
from app.models.user import User
from app.schemas.job import JobCreate, JobListResponse, JobResponse, JobUpdate

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _job_to_response(job: Job) -> JobResponse:
    """Convert ORM Job to JobResponse, parsing skills JSON."""
    data = {
        "id": job.id,
        "recruiter_id": job.recruiter_id,
        "company_id": job.company_id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "employment_type": job.employment_type,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "experience_min": job.experience_min,
        "experience_max": job.experience_max,
        "skills_required": job.skills_list,
        "description": job.description,
        "responsibilities": job.responsibilities,
        "benefits": job.benefits,
        "status": job.status,
        "deadline": job.deadline,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "company": job.company if job.company else None,
        "application_count": len(job.applications) if job.applications else 0,
    }
    return JobResponse(**data)


@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search in title/description"),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List jobs with pagination, full-text search, and filters."""
    query = select(Job).options(selectinload(Job.company), selectinload(Job.applications))

    # Filters
    if search:
        query = query.where(
            or_(
                Job.title.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.where(Job.status == status)
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))
    if employment_type:
        query = query.where(Job.employment_type == employment_type)
    if company_id:
        query = query.where(Job.company_id == company_id)

    # Count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    result = await db.execute(query.order_by(Job.created_at.desc()).offset(offset).limit(page_size))
    jobs = result.scalars().all()

    return JobListResponse(
        items=[_job_to_response(j) for j in jobs],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 0,
    )


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Create a new job posting (recruiters/hr/admin only)."""
    # Get recruiter profile
    result = await db.execute(select(Recruiter).where(Recruiter.user_id == current_user.id))
    recruiter = result.scalars().first()

    company_id = payload.__dict__.get("company_id") or (recruiter.company_id if recruiter else None)

    if not recruiter and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recruiter profile not found",
        )

    job = Job(
        recruiter_id=recruiter.id if recruiter else 1,
        company_id=company_id or 1,
        title=payload.title,
        department=payload.department,
        location=payload.location,
        employment_type=payload.employment_type,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        experience_min=payload.experience_min,
        experience_max=payload.experience_max,
        skills_required=json.dumps(payload.skills_required or []),
        description=payload.description,
        responsibilities=payload.responsibilities,
        benefits=payload.benefits,
        deadline=payload.deadline,
        status=JobStatus.draft,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return _job_to_response(job)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a single job by ID."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.company), selectinload(Job.applications))
        .where(Job.id == job_id)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_to_response(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    payload: JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Update a job (only the owning recruiter or admin)."""
    result = await db.execute(
        select(Job).options(selectinload(Job.company), selectinload(Job.applications)).where(Job.id == job_id)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = payload.model_dump(exclude_none=True)
    if "skills_required" in update_data:
        update_data["skills_required"] = json.dumps(update_data["skills_required"])

    for field, value in update_data.items():
        setattr(job, field, value)

    await db.commit()
    await db.refresh(job)
    return _job_to_response(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Delete a job posting."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.delete(job)
    await db.commit()


@router.post("/{job_id}/publish", response_model=JobResponse)
async def publish_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Change job status from draft → active."""
    result = await db.execute(
        select(Job).options(selectinload(Job.company), selectinload(Job.applications)).where(Job.id == job_id)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status == JobStatus.closed:
        raise HTTPException(status_code=400, detail="Cannot publish a closed job")
    job.status = JobStatus.active
    await db.commit()
    await db.refresh(job)
    return _job_to_response(job)


@router.post("/{job_id}/close", response_model=JobResponse)
async def close_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Close a job - no more applications accepted."""
    result = await db.execute(
        select(Job).options(selectinload(Job.company), selectinload(Job.applications)).where(Job.id == job_id)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = JobStatus.closed
    await db.commit()
    await db.refresh(job)
    return _job_to_response(job)
