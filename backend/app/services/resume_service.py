"""
Resume service - file operations and parse orchestration.
"""
import json
import os
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.models.parsed_resume import ParsedResume
from app.models.resume import Resume
from ai_module.extractor import (
    extract_education,
    extract_email,
    extract_experience,
    extract_name,
    extract_phone,
    extract_skills,
    extract_sections,
)
from ai_module.parser import extract_text


async def parse_and_store_resume(
    db: AsyncSession,
    resume: Resume,
) -> ParsedResume:
    """
    Extract text from the resume file, run NLP extraction, and
    store/update the ParsedResume record.
    """
    # Resolve file path
    file_path = _resolve_file_path(resume.file_url)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"Resume file not found on disk: {resume.file_url}",
        )

    # Extract raw text
    raw_text = extract_text(file_path)
    if not raw_text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from resume file",
        )

    # NLP extraction
    name = extract_name(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    skills = extract_skills(raw_text)
    education = extract_education(raw_text)
    experience = extract_experience(raw_text)
    sections = extract_sections(raw_text)

    # Extract LinkedIn / GitHub from text
    import re
    linkedin = None
    github = None
    linkedin_match = re.search(r"linkedin\.com/in/[\w\-]+", raw_text, re.IGNORECASE)
    github_match = re.search(r"github\.com/[\w\-]+", raw_text, re.IGNORECASE)
    if linkedin_match:
        linkedin = "https://" + linkedin_match.group(0)
    if github_match:
        github = "https://" + github_match.group(0)

    # Check for existing parsed resume (update if exists)
    result = await db.execute(
        select(ParsedResume).where(ParsedResume.resume_id == resume.id)
    )
    parsed = result.scalars().first()

    if parsed:
        parsed.raw_text = raw_text
        parsed.name = name
        parsed.email = email
        parsed.phone = phone
        parsed.skills_list = skills
        parsed.education_list = education
        parsed.experience_list = experience
        parsed.linkedin = linkedin
        parsed.github = github
    else:
        parsed = ParsedResume(
            resume_id=resume.id,
            candidate_id=resume.candidate_id,
            raw_text=raw_text,
            name=name,
            email=email,
            phone=phone,
            linkedin=linkedin,
            github=github,
        )
        parsed.skills_list = skills
        parsed.education_list = education
        parsed.experience_list = experience
        db.add(parsed)

    await db.commit()
    await db.refresh(parsed)
    return parsed


def _resolve_file_path(file_url: str) -> str:
    """
    Convert a /uploads/<filename> URL to an absolute path on disk.
    """
    if file_url.startswith("/uploads/"):
        filename = file_url[len("/uploads/"):]
        return os.path.join(settings.UPLOAD_DIR, filename)
    # If it looks like an absolute path already, return as-is
    return file_url


def validate_file_extension(filename: str) -> bool:
    """Return True if the file has an allowed extension."""
    ext = Path(filename).suffix.lower()
    return ext in {".pdf", ".docx"}
