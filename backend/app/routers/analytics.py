import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query
from sqlalchemy import select, func, and_, case

from ..dependencies import CurrentUser, DB
from ..models.task import Task, TaskStatus
from ..models.project import Project
from ..schemas.analytics import CompletionStats, DailyCount, StatusDistribution, ProjectProgress

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/completion", response_model=CompletionStats)
async def completion_stats(
    current_user: CurrentUser,
    db: DB,
    period: str = Query("week", regex="^(week|month)$"),
):
    days = 7 if period == "week" else 30
    start = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Task.updated_at).label("date"),
            func.count(Task.id).label("count"),
        )
        .where(
            and_(
                Task.status == TaskStatus.done,
                Task.updated_at >= start,
                (Task.creator_id == current_user.id) | (Task.assignee_id == current_user.id),
                Task.deleted_at.is_(None),
            )
        )
        .group_by(func.date(Task.updated_at))
        .order_by(func.date(Task.updated_at))
    )
    rows = result.all()
    data = [DailyCount(date=str(r.date), count=r.count) for r in rows]
    return CompletionStats(period=period, data=data)


@router.get("/status-distribution", response_model=list[StatusDistribution])
async def status_distribution(
    current_user: CurrentUser,
    db: DB,
    project_id: uuid.UUID | None = Query(None),
):
    stmt = (
        select(Task.status, func.count(Task.id).label("count"))
        .where(
            (Task.creator_id == current_user.id) | (Task.assignee_id == current_user.id),
            Task.deleted_at.is_(None),
        )
        .group_by(Task.status)
    )
    if project_id:
        stmt = stmt.where(Task.project_id == project_id)

    result = await db.execute(stmt)
    return [StatusDistribution(status=r.status, count=r.count) for r in result.all()]


@router.get("/project-progress/{project_id}", response_model=ProjectProgress)
async def project_progress(project_id: uuid.UUID, current_user: CurrentUser, db: DB):
    proj_result = await db.execute(select(Project).where(Project.id == project_id))
    project = proj_result.scalar_one_or_none()

    result = await db.execute(
        select(
            func.count(Task.id).label("total"),
            func.sum(case((Task.status == TaskStatus.done, 1), else_=0)).label("done"),
        )
        .where(Task.project_id == project_id, Task.deleted_at.is_(None))
    )
    row = result.one()
    total = row.total or 0
    done = row.done or 0
    percent = round((done / total * 100) if total > 0 else 0.0, 1)

    return ProjectProgress(
        project_id=str(project_id),
        project_name=project.name if project else "",
        total=total,
        done=done,
        percent=percent,
    )
