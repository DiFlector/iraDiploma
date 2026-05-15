import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..dependencies import CurrentUser, DB
from ..models.tag import Tag
from ..schemas.tag import TagCreate, TagUpdate, TagRead

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[TagRead])
async def list_tags(current_user: CurrentUser, db: DB):
    result = await db.execute(select(Tag).where(Tag.user_id == current_user.id).order_by(Tag.name))
    return result.scalars().all()


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(payload: TagCreate, current_user: CurrentUser, db: DB):
    tag = Tag(name=payload.name, color=payload.color, user_id=current_user.id)
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return tag


@router.patch("/{tag_id}", response_model=TagRead)
async def update_tag(tag_id: uuid.UUID, payload: TagUpdate, current_user: CurrentUser, db: DB):
    result = await db.execute(select(Tag).where(Tag.id == tag_id, Tag.user_id == current_user.id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(tag, field, value)
    await db.flush()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: uuid.UUID, current_user: CurrentUser, db: DB):
    result = await db.execute(select(Tag).where(Tag.id == tag_id, Tag.user_id == current_user.id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
