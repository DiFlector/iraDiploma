import uuid

from pydantic import BaseModel, ConfigDict, field_validator


class TagCreate(BaseModel):
    name: str
    color: str = "#3B82F6"

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        if not v.startswith("#") or len(v) != 7:
            raise ValueError("Color must be a valid hex color like #3B82F6")
        return v


class TagUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color: str
    user_id: uuid.UUID
