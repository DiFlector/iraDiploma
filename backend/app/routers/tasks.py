import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from ..dependencies import CurrentUser, DB
from ..models.task import Task, TaskStatus, TaskPriority, task_tags_table
from ..models.tag import Tag
from ..models.notification import NotificationType
from ..schemas.task import TaskCreate, TaskUpdate, TaskRead, TaskStatusUpdate
from ..services.notification import create_and_broadcast

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def _load_task(db, task_id: uuid.UUID, current_user_id: uuid.UUID | None = None) -> Task:
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.creator),
            selectinload(Task.assignee),
            selectinload(Task.tags),
            selectinload(Task.subtasks),
            selectinload(Task.comments),
        )
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user_id and task.creator_id != current_user_id and task.assignee_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task


def _enrich(task: Task) -> dict:
    d = {c.key: getattr(task, c.key) for c in Task.__table__.columns}
    d["creator"] = task.creator
    d["assignee"] = task.assignee
    d["tags"] = task.tags
    d["subtasks_count"] = len([s for s in task.subtasks if s.deleted_at is None])
    d["comments_count"] = len(task.comments)
    return d


@router.get("", response_model=list[TaskRead])
async def list_tasks(
    current_user: CurrentUser,
    db: DB,
    status: TaskStatus | None = Query(None),
    priority: TaskPriority | None = Query(None),
    project_id: uuid.UUID | None = Query(None),
    assignee_id: uuid.UUID | None = Query(None),
    search: str | None = Query(None),
    include_deleted: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, le=1000),
):
    stmt = (
        select(Task)
        .options(
            selectinload(Task.creator),
            selectinload(Task.assignee),
            selectinload(Task.tags),
            selectinload(Task.subtasks),
            selectinload(Task.comments),
        )
        .where(
            (Task.creator_id == current_user.id) | (Task.assignee_id == current_user.id)
        )
        # подзадачи не показываем в общем списке — они видны внутри родительской задачи
        .where(Task.parent_task_id.is_(None))
    )

    if not include_deleted:
        stmt = stmt.where(Task.deleted_at.is_(None))
    if status:
        stmt = stmt.where(Task.status == status)
    if priority:
        stmt = stmt.where(Task.priority == priority)
    if project_id:
        stmt = stmt.where(Task.project_id == project_id)
    if assignee_id:
        stmt = stmt.where(Task.assignee_id == assignee_id)
    if search:
        stmt = stmt.where(Task.title.ilike(f"%{search}%"))

    stmt = stmt.order_by(Task.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return [_enrich(t) for t in tasks]


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, current_user: CurrentUser, db: DB):
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        project_id=payload.project_id,
        assignee_id=payload.assignee_id,
        parent_task_id=payload.parent_task_id,
        creator_id=current_user.id,
    )
    db.add(task)
    await db.flush()

    if payload.tag_ids:
        # Вставляем прямо в join-таблицу, чтобы не триггерить async lazy-load
        await db.execute(
            task_tags_table.insert(),
            [{"task_id": task.id, "tag_id": tid} for tid in payload.tag_ids],
        )
        await db.flush()

    if payload.assignee_id and payload.assignee_id != current_user.id:
        await create_and_broadcast(
            db, payload.assignee_id, NotificationType.assignment,
            f"Вам назначена задача: {payload.title}", task.id
        )

    return _enrich(await _load_task(db, task.id, current_user.id))


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    return _enrich(await _load_task(db, task_id, current_user.id))


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(task_id: uuid.UUID, payload: TaskUpdate, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)

    old_assignee = task.assignee_id
    for field, value in payload.model_dump(exclude_none=True, exclude={"tag_ids"}).items():
        setattr(task, field, value)

    if payload.tag_ids is not None:
        tag_result = await db.execute(select(Tag).where(Tag.id.in_(payload.tag_ids)))
        task.tags = tag_result.scalars().all()

    await db.flush()

    if payload.assignee_id and payload.assignee_id != old_assignee and payload.assignee_id != current_user.id:
        await create_and_broadcast(
            db, payload.assignee_id, NotificationType.assignment,
            f"Вам назначена задача: {task.title}", task.id
        )

    return _enrich(await _load_task(db, task.id, current_user.id))


@router.patch("/{task_id}/status", response_model=TaskRead)
async def update_status(task_id: uuid.UUID, payload: TaskStatusUpdate, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    task.status = payload.status
    await db.flush()
    return _enrich(await _load_task(db, task.id, current_user.id))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def soft_delete_task(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    if task.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    task.deleted_at = datetime.now(timezone.utc)
    await db.flush()


@router.post("/{task_id}/restore", response_model=TaskRead)
async def restore_task(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    if task.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    task.deleted_at = None
    await db.flush()
    return _enrich(await _load_task(db, task.id, current_user.id))


@router.delete("/{task_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def hard_delete_task(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    if task.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.delete(task)


@router.get("/{task_id}/subtasks", response_model=list[TaskRead])
async def get_subtasks(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.creator),
            selectinload(Task.assignee),
            selectinload(Task.tags),
            selectinload(Task.subtasks),
            selectinload(Task.comments),
        )
        .where(Task.parent_task_id == task_id, Task.deleted_at.is_(None))
    )
    return [_enrich(t) for t in result.scalars().all()]


@router.post("/{task_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def attach_tag(task_id: uuid.UUID, tag_id: uuid.UUID, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    tag_result = await db.execute(select(Tag).where(Tag.id == tag_id))
    tag = tag_result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    if tag not in task.tags:
        task.tags.append(tag)
    await db.flush()


@router.delete("/{task_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def detach_tag(task_id: uuid.UUID, tag_id: uuid.UUID, current_user: CurrentUser, db: DB):
    task = await _load_task(db, task_id, current_user.id)
    task.tags = [t for t in task.tags if t.id != tag_id]
    await db.flush()
