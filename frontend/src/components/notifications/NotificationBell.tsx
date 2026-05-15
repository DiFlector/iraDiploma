import { useState, useEffect, useRef } from 'react'
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography, Button, Box, Divider } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useAppSelector } from '../../store'
import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '../../api/notificationsApi'
import { baseApi } from '../../api/baseApi'
import { useAppDispatch } from '../../store'
import type { Notification } from '../../types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function NotificationBell() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const token = useAppSelector((s) => s.auth.token)
  const dispatch = useAppDispatch()
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 })
  const [markRead] = useMarkReadMutation()
  const [markAllRead] = useMarkAllReadMutation()
  const wsRef = useRef<WebSocket | null>(null)

  const unread = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!token) return
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/notifications?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = () => {
      dispatch(baseApi.util.invalidateTags(['Notification']))
    }

    return () => {
      ws.close()
    }
  }, [token, dispatch])

  const handleClick = (notif: Notification) => {
    if (!notif.is_read) markRead(notif.id)
  }

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 480 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Уведомления</Typography>
          {unread > 0 && (
            <Button size="small" onClick={() => markAllRead()}>Прочитать все</Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">Нет уведомлений</Typography>
          </Box>
        ) : (
          <List dense sx={{ overflow: 'auto', maxHeight: 360 }}>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                button
                onClick={() => handleClick(n)}
                sx={{ bgcolor: n.is_read ? 'transparent' : 'primary.50', alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={n.content}
                  secondary={format(new Date(n.created_at), 'd MMM HH:mm', { locale: ru })}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: n.is_read ? 400 : 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}
