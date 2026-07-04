"""
Analytics routes - dashboard stats, hiring funnel, trends.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.application import Application, ApplicationStage
from app.models.candidate import Candidate
from app.models.interview import Interview
from app.models.job import Job, JobStatus
from app.models.recruiter import Recruiter
from app.models.user import User
from app.schemas.analytics import DashboardStats, FunnelStage, HiringFunnel, TrendData, TrendPoint

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Aggregate hiring stats for the current recruiter or all (admin)."""
    # Determine scope
    job_filter = []
    if current_user.role != "admin":
        rec_result = await db.execute(select(Recruiter).where(Recruiter.user_id == current_user.id))
        recruiter = rec_result.scalars().first()
        if recruiter:
            job_ids_result = await db.execute(
                select(Job.id).where(Job.recruiter_id == recruiter.id)
            )
            job_ids = [r[0] for r in job_ids_result.all()]
            job_filter = [Application.job_id.in_(job_ids)] if job_ids else [Application.job_id == -1]

    # Jobs
    total_jobs = (await db.execute(select(func.count(Job.id)))).scalar() or 0
    active_jobs = (
        await db.execute(select(func.count(Job.id)).where(Job.status == JobStatus.active))
    ).scalar() or 0

    # Applications
    app_query = select(Application)
    if job_filter:
        app_query = app_query.where(*job_filter)
    apps = (await db.execute(app_query)).scalars().all()

    total_applications = len(apps)
    shortlisted = sum(1 for a in apps if a.stage in ("shortlisted", "interview", "technical", "hr_round", "offer", "hired"))
    interviews_scheduled = sum(1 for a in apps if a.stage in ("interview", "technical", "hr_round"))
    hired = sum(1 for a in apps if a.stage == "hired")
    rejected = sum(1 for a in apps if a.stage == "rejected")

    scores = [a.ai_score for a in apps if a.ai_score is not None]
    avg_score = round(sum(scores) / len(scores), 2) if scores else None

    return DashboardStats(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_applications=total_applications,
        shortlisted=shortlisted,
        interviews_scheduled=interviews_scheduled,
        hired=hired,
        rejected=rejected,
        avg_ai_score=avg_score,
    )


@router.get("/funnel", response_model=HiringFunnel)
async def hiring_funnel(
    job_id: Optional[int] = Query(None, description="Filter funnel for a specific job"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Return count per pipeline stage (optionally for a single job)."""
    query = select(Application)
    if job_id:
        query = query.where(Application.job_id == job_id)

    result = await db.execute(query)
    apps = result.scalars().all()
    total = len(apps)

    stage_counts: dict[str, int] = defaultdict(int)
    for app in apps:
        stage_counts[app.stage] += 1

    ordered_stages = [
        "applied", "screening", "shortlisted", "interview",
        "technical", "hr_round", "offer", "hired", "rejected",
    ]
    stages = [
        FunnelStage(
            stage=s,
            count=stage_counts.get(s, 0),
            percentage=round((stage_counts.get(s, 0) / total * 100), 2) if total else 0.0,
        )
        for s in ordered_stages
    ]

    return HiringFunnel(job_id=job_id, stages=stages, total_applications=total)


@router.get("/trends", response_model=TrendData)
async def hiring_trends(
    months: int = Query(6, ge=1, le=24, description="Number of past months"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Monthly application, shortlist, and hire trends."""
    cutoff = datetime.utcnow() - timedelta(days=months * 30)

    result = await db.execute(
        select(Application).where(Application.applied_at >= cutoff)
    )
    apps = result.scalars().all()

    # Group by month
    monthly: dict[str, dict] = defaultdict(lambda: {"applications": 0, "shortlisted": 0, "hired": 0})
    for app in apps:
        period = app.applied_at.strftime("%Y-%m") if app.applied_at else "unknown"
        monthly[period]["applications"] += 1
        if app.stage in ("shortlisted", "interview", "technical", "hr_round", "offer", "hired"):
            monthly[period]["shortlisted"] += 1
        if app.stage == "hired":
            monthly[period]["hired"] += 1

    data = [
        TrendPoint(
            period=period,
            applications=vals["applications"],
            shortlisted=vals["shortlisted"],
            hired=vals["hired"],
        )
        for period, vals in sorted(monthly.items())
    ]

    return TrendData(data=data, period_type="monthly")
