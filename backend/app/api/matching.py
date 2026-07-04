"""
Matching routes - AI resume-job matching and candidate rankings.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.parsed_resume import ParsedResume
from app.models.resume import Resume
from app.models.user import User
from app.schemas.matching import CandidateRank, MatchRequest, MatchResult, RankingResult
from ai_module.matcher import compute_match_score
from ai_module.ranker import get_recommendation, rank_candidates

router = APIRouter(prefix="/match", tags=["AI Matching"])


@router.post("", response_model=MatchResult)
async def match_resume_to_job(
    payload: MatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run AI matching between a parsed resume and a job posting.
    Returns overall score (0-100) and category breakdown.
    """
    # Fetch parsed resume
    result = await db.execute(
        select(ParsedResume).where(ParsedResume.resume_id == payload.resume_id)
    )
    parsed = result.scalars().first()
    if not parsed:
        raise HTTPException(status_code=404, detail="Parsed resume not found. Run /resumes/{id}/parse first.")

    # Fetch job
    result = await db.execute(select(Job).where(Job.id == payload.job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Prepare data dicts for matcher
    parsed_data = {
        "skills": parsed.skills_list,
        "education": parsed.education_list,
        "experience": parsed.experience_list,
        "raw_text": parsed.raw_text or "",
        "years_experience": 0,
    }
    # Try to infer years_experience from experience list
    if parsed.experience_list:
        parsed_data["years_experience"] = len(parsed.experience_list)

    job_data = {
        "skills_required": job.skills_list,
        "description": (job.description or "") + " " + (job.responsibilities or ""),
        "experience_min": job.experience_min or 0,
        "experience_max": job.experience_max or 10,
        "education_keywords": ["bachelor", "master", "phd", "b.tech", "m.tech", "degree"],
    }

    score_result = compute_match_score(parsed_data, job_data)

    # Optionally persist score on any related application
    app_result = await db.execute(
        select(Application).where(
            Application.job_id == payload.job_id,
            Application.candidate_id == parsed.candidate_id,
        )
    )
    application = app_result.scalars().first()
    if application:
        application.ai_score = score_result["overall_score"]
        await db.commit()

    recommendation = get_recommendation(score_result["overall_score"])

    return MatchResult(
        resume_id=payload.resume_id,
        job_id=payload.job_id,
        overall_score=score_result["overall_score"],
        recommendation=recommendation,
        breakdown=score_result["breakdown"],
        matching_skills=score_result["matching_skills"],
        missing_skills=score_result["missing_skills"],
        summary=(
            f"Candidate scored {score_result['overall_score']:.1f}/100 for this position. "
            f"Recommendation: {recommendation}."
        ),
    )


@router.get("/rankings/{job_id}", response_model=RankingResult)
async def rank_job_candidates(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("recruiter", "hr", "admin")),
):
    """Return all candidates who applied to a job, ranked by AI score."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Get all applications for this job
    apps_result = await db.execute(
        select(Application)
        .options(selectinload(Application.candidate))
        .where(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()

    # Build ranking entries
    entries = []
    for app in applications:
        candidate = app.candidate
        user_result = await db.execute(
            select(User).where(User.id == candidate.user_id)
        ) if candidate else None
        user = user_result.scalars().first() if user_result else None

        # Fetch parsed resume for matching skills breakdown if score missing
        parsed_result = await db.execute(
            select(ParsedResume).where(ParsedResume.candidate_id == app.candidate_id)
        )
        parsed = parsed_result.scalars().first()

        matching_skills: list[str] = []
        missing_skills: list[str] = []
        if parsed and job.skills_list:
            candidate_skills_lower = {s.lower() for s in parsed.skills_list}
            for skill in job.skills_list:
                if skill.lower() in candidate_skills_lower:
                    matching_skills.append(skill)
                else:
                    missing_skills.append(skill)

        entries.append(
            CandidateRank(
                rank=0,  # set after sort
                application_id=app.id,
                candidate_id=app.candidate_id,
                candidate_name=user.full_name if user else f"Candidate #{app.candidate_id}",
                ai_score=app.ai_score,
                recommendation=get_recommendation(app.ai_score) if app.ai_score is not None else None,
                matching_skills=matching_skills,
                missing_skills=missing_skills,
            )
        )

    # Sort by score descending (None scores go last)
    ranked = rank_candidates(entries)

    return RankingResult(
        job_id=job_id,
        job_title=job.title,
        total_candidates=len(ranked),
        rankings=ranked,
    )
