import os
import uuid

import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException

from ..dependencies import CurrentUser, DB
from ..schemas.user import UserRead, UserUpdate, PasswordChange
from ..services.auth import hash_password, verify_password

router = APIRouter(prefix="/users", tags=["users"])

STATIC_DIR = "static/avatars"
os.makedirs(STATIC_DIR, exist_ok=True)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_me(payload: UserUpdate, current_user: CurrentUser, db: DB):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.patch("/me/password", status_code=200)
async def change_password(payload: PasswordChange, current_user: CurrentUser, db: DB):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Неверный текущий пароль")
    current_user.password_hash = hash_password(payload.new_password)
    await db.flush()
    return {"message": "Пароль изменён"}


MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/me/avatar", response_model=UserRead)
async def upload_avatar(current_user: CurrentUser, db: DB, file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP images are allowed")

    content = await file.read(MAX_AVATAR_BYTES + 1)
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(STATIC_DIR, filename)

    async with aiofiles.open(path, "wb") as out:
        await out.write(content)

    current_user.avatar_url = f"/static/avatars/{filename}"
    await db.flush()
    await db.refresh(current_user)
    return current_user
