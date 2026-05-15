import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..dependencies import CurrentUser, DB
from ..models.comment import Comment
from ..models.task import Task
from ..models.notification import NotificationType
from ..schemas.comment import CommentCreate, CommentUpdate, CommentRead
from ..services.notification import create_and_broadcast

router = APIRouter(tags=["comments"])


@router.get("/tasks/{task_id}/comments", response_model=list[CommentRead])
async def list_comments(task_id: uuid.UUID, current_user: CurrentUser, db: DB):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
    )
    return result.scalars().all()


@router.post("/tasks/{task_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(task_id: uuid.UUID, payload: CommentCreate, current_user: CurrentUser, db: DB):
    task_result = await db.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = Comment(content=payload.content, task_id=task_id, user_id=current_user.id)
    db.add(comment)
    await db.flush()

    if task.creator_id != current_user.id:
        await create_and_broadcast(
            db, task.creator_id, NotificationType.comment,
            f"{current_user.first_name} прокомментировал задачу: {task.title}", task_id
        )
    if task.assignee_id and task.assignee_id != current_user.id and task.assignee_id != task.creator_id:
        await create_and_broadcast(
            db, task.assignee_id, NotificationType.comment,
            f"{current_user.first_name} прокомментировал задачу: {task.title}", task_id
        )

    result = await db.execute(
        select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment.id)
    )
    return result.scalar_one()


@router.patch("/tasks/{task_id}/comments/{comment_id}", response_model=CommentRead)
async def update_comment(task_id: uuid.UUID, comment_id: uuid.UUID, payload: CommentUpdate, current_user: CurrentUser, db: DB):
    result = await db.execute(
        select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment_id, Comment.task_id == task_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    comment.content = payload.content
    await db.flush()
    await db.refresh(comment)
    return comment


@router.delete("/tasks/{task_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(task_id: uuid.UUID, comment_id: uuid.UUID, current_user: CurrentUser, db: DB):
    result = await db.execute(
        select(Comment).where(Comment.id == comment_id, Comment.task_id == task_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.delete(comment)
