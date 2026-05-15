import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..models.notification import NotificationType


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: NotificationType
    content: str
    is_read: bool
    created_at: datetime
    task_id: uuid.UUID | None
