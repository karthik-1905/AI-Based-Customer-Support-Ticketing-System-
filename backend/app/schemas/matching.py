"""
Matching schemas - AI match request and result models.
"""
from typing import Dict, List, Optional

from pydantic import BaseModel


class MatchRequest(BaseModel):
    resume_id: int
    job_id: int


class MatchResult(BaseModel):
    resume_id: int
    job_id: int
    overall_score: float          # 0-100
    recommendation: str           # Excellent / Good / Average / Not Recommended
    breakdown: Dict[str, float]   # e.g. {"skills": 85.0, "experience": 70.0, ...}
    matching_skills: List[str]
    missing_skills: List[str]
    summary: str


class CandidateRank(BaseModel):
    rank: int
    application_id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    ai_score: Optional[float] = None
    recommendation: Optional[str] = None
    matching_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []


class RankingResult(BaseModel):
    job_id: int
    job_title: str
    total_candidates: int
    rankings: List[CandidateRank]
