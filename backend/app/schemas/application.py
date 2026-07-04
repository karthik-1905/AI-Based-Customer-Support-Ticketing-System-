"""
Application schemas - apply, respond, and stage transitions.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None  # optionally attach a specific resume


class StageUpdate(BaseModel):
    stage: str  # Must be a valid ApplicationStage value
    notes: Optional[str] = None  # optional internal notes


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    stage: str
    ai_score: Optional[float] = None
    applied_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationDetail(ApplicationResponse):
    """Extended application response with nested objects."""
    job: Optional[dict] = None
    candidate: Optional[dict] = None
