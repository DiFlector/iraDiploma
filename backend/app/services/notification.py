import json
import uuid
from typing import TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.notification import Notification, NotificationType

if TYPE_CHECKING:
    pass

_connections: dict[str, list] = {}


def register_connection(user_id: str, websocket) -> None:
    _connections.setdefault(user_id, []).append(websocket)


def unregister_connection(user_id: str, websocket) -> None:
    if user_id in _connections:
        _connections[user_id] = [ws for ws in _connections[user_id] if ws is not websocket]
        if not _connections[user_id]:
            del _connections[user_id]


async def broadcast_to_user(user_id: str, payload: dict) -> None:
    websockets = _connections.get(user_id, [])
    dead = []
    for ws in websockets:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.append(ws)
    for ws in dead:
        unregister_connection(user_id, ws)


async def create_and_broadcast(
    db: AsyncSession,
    user_id: uuid.UUID,
    ntype: NotificationType,
    content: str,
    task_id: uuid.UUID | None = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=ntype,
        content=content,
        task_id=task_id,
    )
    db.add(notif)
    await db.flush()
    await db.refresh(notif)

    await broadcast_to_user(
        str(user_id),
        {
            "id": str(notif.id),
            "type": ntype.value,
            "content": content,
            "is_read": False,
            "task_id": str(task_id) if task_id else None,
            "created_at": notif.created_at.isoformat(),
        },
    )
    return notif
