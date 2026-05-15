import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from ..dependencies import CurrentUser, DB
from ..models.project import Project, ProjectMember, ProjectRole
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, InviteMemberRequest, UpdateMemberRoleRequest

router = APIRouter(prefix="/projects", tags=["projects"])


async def _get_project_or_404(db, project_id: uuid.UUID) -> Project:
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.members).selectinload(ProjectMember.user))
        .where(Project.id == project_id)
    )
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj


async def _require_role(db, project_id: uuid.UUID, user_id: uuid.UUID, *roles: ProjectRole) -> ProjectMember:
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member or member.role not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return member


@router.get("", response_model=list[ProjectRead])
async def list_projects(current_user: CurrentUser, db: DB):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.members).selectinload(ProjectMember.user))
        .where(
            or_(
                Project.owner_id == current_user.id,
                Project.id.in_(
                    select(ProjectMember.project_id).where(ProjectMember.user_id == current_user.id)
                ),
            )
        )
        .order_by(Project.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, current_user: CurrentUser, db: DB):
    project = Project(name=payload.name, description=payload.description, owner_id=current_user.id)
    db.add(project)
    await db.flush()

    member = ProjectMember(project_id=project.id, user_id=current_user.id, role=ProjectRole.admin)
    db.add(member)
    await db.flush()

    return await _get_project_or_404(db, project.id)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: uuid.UUID, current_user: CurrentUser, db: DB):
    return await _get_project_or_404(db, project_id)


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(project_id: uuid.UUID, payload: ProjectUpdate, current_user: CurrentUser, db: DB):
    project = await _get_project_or_404(db, project_id)
    await _require_role(db, project_id, current_user.id, ProjectRole.admin)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    await db.flush()

    return await _get_project_or_404(db, project_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: uuid.UUID, current_user: CurrentUser, db: DB):
    project = await _get_project_or_404(db, project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete project")
    await db.delete(project)


@router.post("/{project_id}/members", response_model=ProjectRead)
async def invite_member(project_id: uuid.UUID, payload: InviteMemberRequest, current_user: CurrentUser, db: DB):
    await _require_role(db, project_id, current_user.id, ProjectRole.admin)

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")

    existing = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a member")

    db.add(ProjectMember(project_id=project_id, user_id=user.id, role=payload.role))
    await db.flush()

    return await _get_project_or_404(db, project_id)


@router.patch("/{project_id}/members/{user_id}", response_model=ProjectRead)
async def update_member_role(project_id: uuid.UUID, user_id: uuid.UUID, payload: UpdateMemberRoleRequest, current_user: CurrentUser, db: DB):
    await _require_role(db, project_id, current_user.id, ProjectRole.admin)

    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.role = payload.role
    await db.flush()
    return await _get_project_or_404(db, project_id)


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(project_id: uuid.UUID, user_id: uuid.UUID, current_user: CurrentUser, db: DB):
    await _require_role(db, project_id, current_user.id, ProjectRole.admin)

    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
