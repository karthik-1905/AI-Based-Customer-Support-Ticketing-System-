"""
Resume schemas - file metadata and parsed content responses.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    candidate_id: int
    file_url: str
    file_name: str
    file_type: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ParsedResumeResponse(BaseModel):
    id: int
    resume_id: int
    candidate_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = []
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    parsed_at: datetime

    model_config = {"from_attributes": True}
