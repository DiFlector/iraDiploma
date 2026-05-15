import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..models.task import TaskStatus, TaskPriority
from .user import UserShort
from .tag import TagRead


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.to_do
    priority: TaskPriority = TaskPriority.medium
    due_date: datetime | None = None
    project_id: uuid.UUID | None = None
    assignee_id: uuid.UUID | None = None
    parent_task_id: uuid.UUID | None = None
    tag_ids: list[uuid.UUID] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_date: datetime | None = None
    project_id: uuid.UUID | None = None
    assignee_id: uuid.UUID | None = None
    parent_task_id: uuid.UUID | None = None
    tag_ids: list[uuid.UUID] | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
    creator_id: uuid.UUID
    assignee_id: uuid.UUID | None
    project_id: uuid.UUID | None
    parent_task_id: uuid.UUID | None
    creator: UserShort
    assignee: UserShort | None = None
    tags: list[TagRead] = []
    subtasks_count: int = 0
    comments_count: int = 0
