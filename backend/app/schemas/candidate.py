"""
Candidate schemas - profile view and update models.
"""
from typing import Optional

from pydantic import BaseModel


class CandidateProfile(BaseModel):
    id: int
    user_id: int
    profile_photo: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    years_experience: Optional[float] = None

    model_config = {"from_attributes": True}


class CandidateUpdate(BaseModel):
    profile_photo: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    years_experience: Optional[float] = None


class CandidateDetail(CandidateProfile):
    """Full candidate profile including user info and parsed resume data."""
    full_name: Optional[str] = None
    email: Optional[str] = None
    latest_resume: Optional[dict] = None
    parsed_resume: Optional[dict] = None
    application_count: Optional[int] = 0
