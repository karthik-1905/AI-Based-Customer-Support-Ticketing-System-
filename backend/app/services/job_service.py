"""
Job service - business logic for job operations.
"""
import json
import math
from typing import Any, Dict, List, Optional

from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.job import Job, JobStatus
from app.models.recruiter import Recruiter


async def get_jobs_paginated(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    company_id: Optional[int] = None,
    recruiter_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Fetch jobs with filters and pagination.
    Returns dict with items, total, page, page_size, total_pages.
    """
    query = select(Job).options(selectinload(Job.company), selectinload(Job.applications))

    if search:
        query = query.where(
            or_(
                Job.title.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%"),
                Job.department.ilike(f"%{search}%"),
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
    if recruiter_id:
        query = query.where(Job.recruiter_id == recruiter_id)

    # Count total
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    result = await db.execute(
        query.order_by(Job.created_at.desc()).offset(offset).limit(page_size)
    )
    jobs = result.scalars().all()

    return {
        "items": jobs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 0,
    }


async def get_job_by_id(db: AsyncSession, job_id: int) -> Optional[Job]:
    """Fetch a single job with company and application relations loaded."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.company), selectinload(Job.applications))
        .where(Job.id == job_id)
    )
    return result.scalars().first()


async def create_job(
    db: AsyncSession,
    recruiter: Recruiter,
    title: str,
    **kwargs,
) -> Job:
    """Create and persist a new job posting."""
    skills = kwargs.pop("skills_required", [])
    job = Job(
        recruiter_id=recruiter.id,
        company_id=recruiter.company_id,
        title=title,
        skills_required=json.dumps(skills),
        **kwargs,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def publish_job(db: AsyncSession, job: Job) -> Job:
    """Set job status to active."""
    job.status = JobStatus.active
    await db.commit()
    await db.refresh(job)
    return job


async def close_job(db: AsyncSession, job: Job) -> Job:
    """Set job status to closed."""
    job.status = JobStatus.closed
    await db.commit()
    await db.refresh(job)
    return job


async def search_active_jobs(
    db: AsyncSession,
    keyword: str,
    limit: int = 10,
) -> List[Job]:
    """Quick keyword search across active jobs."""
    result = await db.execute(
        select(Job)
        .where(
            Job.status == JobStatus.active,
            or_(
                Job.title.ilike(f"%{keyword}%"),
                Job.description.ilike(f"%{keyword}%"),
            ),
        )
        .limit(limit)
    )
    return result.scalars().all()
