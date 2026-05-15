import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .user import UserShort


class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime
    task_id: uuid.UUID
    user_id: uuid.UUID
    user: UserShort
