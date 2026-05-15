from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from ..services.auth import verify_access_token
from ..services.notification import register_connection, unregister_connection

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/notifications")
async def ws_notifications(websocket: WebSocket, token: str = Query(...)):
    user_id = verify_access_token(token)
    if not user_id:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    register_connection(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        unregister_connection(user_id, websocket)
