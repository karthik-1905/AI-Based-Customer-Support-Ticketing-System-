"""
Interview schemas - scheduling and response models.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class InterviewCreate(BaseModel):
    application_id: int
    scheduled_at: datetime
    duration_minutes: int = 60
    mode: str = "google_meet"
    meeting_link: Optional[str] = None
    panel: Optional[List[str]] = []
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    mode: Optional[str] = None
    meeting_link: Optional[str] = None
    panel: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    application_id: int
    scheduled_at: datetime
    duration_minutes: int
    mode: str
    meeting_link: Optional[str] = None
    panel: Optional[List[str]] = []
    notes: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
