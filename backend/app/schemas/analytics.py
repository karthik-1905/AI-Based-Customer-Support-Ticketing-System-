"""
Analytics schemas - dashboard stats, funnel data, trends.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_jobs: int
    active_jobs: int
    total_applications: int
    shortlisted: int
    interviews_scheduled: int
    hired: int
    rejected: int
    avg_ai_score: Optional[float] = None


class FunnelStage(BaseModel):
    stage: str
    count: int
    percentage: float


class HiringFunnel(BaseModel):
    job_id: Optional[int] = None
    stages: List[FunnelStage]
    total_applications: int


class TrendPoint(BaseModel):
    period: str   # e.g. "2024-01" for monthly
    applications: int
    shortlisted: int
    hired: int


class TrendData(BaseModel):
    data: List[TrendPoint]
    period_type: str = "monthly"  # monthly / weekly
