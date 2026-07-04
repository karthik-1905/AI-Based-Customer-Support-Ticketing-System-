"""
Resumes routes - upload, fetch, trigger parse.
"""
import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.security import get_current_user, require_role
from app.db.database import get_db
from app.models.candidate import Candidate
from app.models.parsed_resume import ParsedResume
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ParsedResumeResponse, ResumeResponse
from app.services.resume_service import parse_and_store_resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    """Upload a resume file (PDF or DOCX). Saves to disk and records metadata."""
    # Validate extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # File size check
    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB} MB",
        )

    # Get candidate profile
    result = await db.execute(select(Candidate).where(Candidate.user_id == current_user.id))
    candidate = result.scalars().first()
    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate profile not found")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_bytes)

    # Determine file_type string
    file_type = "pdf" if ext == ".pdf" else "docx"
    file_url = f"/uploads/{unique_name}"

    resume = Resume(
        candidate_id=candidate.id,
        file_url=file_url,
        file_name=file.filename or unique_name,
        file_type=file_type,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch resume metadata by ID."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.post("/{resume_id}/parse", response_model=ParsedResumeResponse)
async def parse_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger AI parsing of an uploaded resume.
    Extracts name, email, phone, skills, education, experience, etc.
    """
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalars().first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    parsed = await parse_and_store_resume(db, resume)
    return parsed
