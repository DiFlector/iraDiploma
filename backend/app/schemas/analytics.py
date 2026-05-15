from pydantic import BaseModel

from ..models.task import TaskStatus


class DailyCount(BaseModel):
    date: str
    count: int


class CompletionStats(BaseModel):
    period: str
    data: list[DailyCount]


class StatusDistribution(BaseModel):
    status: TaskStatus
    count: int


class ProjectProgress(BaseModel):
    project_id: str
    project_name: str
    total: int
    done: int
    percent: float
