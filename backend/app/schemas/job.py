"""
Job schemas - create, update, and response models.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: str = Field(default="full_time")
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    skills_required: Optional[List[str]] = []
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    deadline: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    skills_required: Optional[List[str]] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None


class CompanyMini(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    industry: Optional[str] = None

    model_config = {"from_attributes": True}


class JobResponse(BaseModel):
    id: int
    recruiter_id: int
    company_id: int
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    skills_required: Optional[List[str]] = []
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    benefits: Optional[str] = None
    status: str
    deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    company: Optional[CompanyMini] = None
    application_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
