"""
Application service - apply logic, stage transitions, notifications.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.application import Application, ApplicationStage
from app.models.candidate import Candidate
from app.models.job import Job, JobStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate
from app.services.notification_service import create_notification

# Valid stage transitions (from -> allowed next stages)
STAGE_TRANSITIONS: dict[str, list[str]] = {
    "applied": ["screening", "shortlisted", "rejected"],
    "screening": ["shortlisted", "rejected"],
    "shortlisted": ["interview", "rejected"],
    "interview": ["technical", "hr_round", "rejected"],
    "technical": ["hr_round", "offer", "rejected"],
    "hr_round": ["offer", "rejected"],
    "offer": ["hired", "rejected"],
    "hired": [],
    "rejected": [],
}


async def create_application(
    db: AsyncSession,
    current_user: User,
    payload: ApplicationCreate,
) -> Application:
    """
    Apply to a job.
    Validates:
      - Job must exist and be active.
      - No duplicate applications (one per job per candidate).
    """
    # Ensure candidate profile exists
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalars().first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate profile not found",
        )

    # Check job exists and is active
    job_result = await db.execute(select(Job).where(Job.id == payload.job_id))
    job = job_result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is not accepting applications",
        )

    # Prevent duplicate application
    dup_result = await db.execute(
        select(Application).where(
            Application.job_id == payload.job_id,
            Application.candidate_id == candidate.id,
        )
    )
    if dup_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this job",
        )

    # Create application
    application = Application(
        job_id=payload.job_id,
        candidate_id=candidate.id,
        stage=ApplicationStage.applied,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    # Notify candidate
    await create_notification(
        db=db,
        user_id=current_user.id,
        title="Application Submitted",
        message=f"Your application for '{job.title}' has been submitted successfully.",
        notification_type="application",
    )

    return application


async def update_stage(
    db: AsyncSession,
    application_id: int,
    new_stage: str,
    current_user: User,
) -> Application:
    """
    Move an application to a new pipeline stage.
    Validates the stage transition is allowed.
    """
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalars().first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Validate stage value
    valid_stages = [s.value for s in ApplicationStage]
    if new_stage not in valid_stages:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage. Valid stages: {', '.join(valid_stages)}",
        )

    # Check transition is allowed
    allowed = STAGE_TRANSITIONS.get(application.stage, [])
    if new_stage not in allowed:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot transition from '{application.stage}' to '{new_stage}'. "
                f"Allowed: {', '.join(allowed) or 'none'}"
            ),
        )

    old_stage = application.stage
    application.stage = new_stage
    await db.commit()
    await db.refresh(application)

    # Notify candidate about stage change
    # Fetch candidate user_id
    cand_result = await db.execute(
        select(Candidate).where(Candidate.id == application.candidate_id)
    )
    cand = cand_result.scalars().first()
    if cand:
        friendly_stage = new_stage.replace("_", " ").title()
        await create_notification(
            db=db,
            user_id=cand.user_id,
            title="Application Status Updated",
            message=f"Your application status has been updated to: {friendly_stage}.",
            notification_type="application",
        )

    return application
