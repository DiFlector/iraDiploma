import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from ..models.project import ProjectRole
from .user import UserShort


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProjectMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    role: ProjectRole
    user: UserShort


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    members: list[ProjectMemberRead] = []


class ProjectShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: ProjectRole = ProjectRole.editor


class UpdateMemberRoleRequest(BaseModel):
    role: ProjectRole
