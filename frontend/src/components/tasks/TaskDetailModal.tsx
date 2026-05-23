import { useState, useRef } from 'react'
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
  Chip, Divider, Tooltip, CircularProgress, Avatar, TextField,
  Button, Checkbox, FormControlLabel, Stack, List, ListItem,
  ListItemText, ListItemAvatar,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import AddIcon from '@mui/icons-material/Add'
import EventIcon from '@mui/icons-material/Event'
import type { Task } from '../../types'
import {
  TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS, TASK_STATUS_COLORS,
} from '../../types'
import {
  useGetSubtasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation,
  useGetCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation,
} from '../../api/tasksApi'
import { useAppSelector } from '../../store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { googleCalendarUrl } from '../../utils/calendarUtils'
import TaskForm from './TaskForm'

interface Props {
  task: Task
  open: boolean
  onClose: () => void
}

export default function TaskDetailModal({ task, open, onClose }: Props) {
  const currentUserId = useAppSelector((s) => s.auth.user?.id)
  const [editOpen, setEditOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)

  const { data: subtasks = [], isLoading: subtasksLoading } = useGetSubtasksQuery(task.id, { skip: !open })
  const { data: comments = [], isLoading: commentsLoading } = useGetCommentsQuery(task.id, { skip: !open })

  const [createTask] = useCreateTaskMutation()
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [createComment] = useCreateCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()

  const commentsEndRef = useRef<HTMLDivElement>(null)

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    await createTask({ title: newSubtaskTitle.trim(), parent_task_id: task.id, status: 'to_do', priority: task.priority })
    setNewSubtaskTitle('')
    setAddingSubtask(false)
  }

  const handleToggleSubtask = async (subtask: Task) => {
    const newStatus = subtask.status === 'done' ? 'to_do' : 'done'
    await updateStatus({ id: subtask.id, status: newStatus })
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return
    await createComment({ taskId: task.id, content: commentText.trim() })
    setCommentText('')
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper" sx={{ '& .MuiDialog-paper': { m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: '100%' } } }}>
        <DialogTitle sx={{ pr: 6, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="span" sx={{ overflowWrap: 'anywhere' }}>{task.title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              <Chip
                label={TASK_STATUS_LABELS[task.status]}
                size="small"
                sx={{ bgcolor: TASK_STATUS_COLORS[task.status], color: '#fff', fontWeight: 600 }}
              />
              <Chip
                label={TASK_PRIORITY_LABELS[task.priority]}
                size="small"
                sx={{ bgcolor: TASK_PRIORITY_COLORS[task.priority], color: '#fff' }}
              />
              {task.tags.map((t) => (
                <Chip key={t.id} label={t.name} size="small" sx={{ bgcolor: t.color, color: '#fff' }} />
              ))}
            </Box>
          </Box>
          <Tooltip title="Редактировать">
            <IconButton size="small" onClick={() => setEditOpen(true)}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Мета-информация */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.25, sm: 3 }, mb: 2 }}>
            {task.due_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Дедлайн:</Typography>
                <Typography variant="caption" color={new Date(task.due_date) < new Date() ? 'error.main' : 'text.primary'}>
                  {format(new Date(task.due_date), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </Typography>
                <Tooltip title="Добавить в Google Calendar">
                  <IconButton
                    size="small" component="a"
                    href={googleCalendarUrl(task)} target="_blank" rel="noopener noreferrer"
                    sx={{ p: 0.2, color: 'text.secondary', '&:hover': { color: '#4285f4' } }}
                  >
                    <EventIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {task.assignee && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Исполнитель:</Typography>
                <Avatar sx={{ width: 18, height: 18, fontSize: 9, bgcolor: 'secondary.main' }}>
                  {task.assignee.first_name?.[0] ?? '?'}
                </Avatar>
                <Typography variant="caption">{task.assignee.first_name} {task.assignee.last_name}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>Создал:</Typography>
              <Typography variant="caption">{task.creator.first_name} {task.creator.last_name}</Typography>
            </Box>
          </Box>

          {task.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Описание</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{task.description}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Подзадачи */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Подзадачи {subtasks.length > 0 && `(${subtasks.filter(s => s.status === 'done').length}/${subtasks.length})`}
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setAddingSubtask(true)}>
                Добавить
              </Button>
            </Box>

            {subtasksLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Box>
                {subtasks.map((s) => (
                  <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', py: 0.25, minWidth: 0 }}>
                    <Checkbox
                      size="small"
                      checked={s.status === 'done'}
                      onChange={() => handleToggleSubtask(s)}
                      sx={{ p: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: s.status === 'done' ? 'line-through' : 'none', color: s.status === 'done' ? 'text.disabled' : 'text.primary', overflowWrap: 'anywhere' }}
                    >
                      {s.title}
                    </Typography>
                  </Box>
                ))}
                {subtasks.length === 0 && !addingSubtask && (
                  <Typography variant="caption" color="text.disabled">Нет подзадач</Typography>
                )}
              </Box>
            )}

            {addingSubtask && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="Название подзадачи"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask()
                    if (e.key === 'Escape') { setAddingSubtask(false); setNewSubtaskTitle('') }
                  }}
                  autoFocus
                  sx={{ flex: 1 }}
                />
                <Button size="small" variant="contained" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
                  OK
                </Button>
                <Button size="small" onClick={() => { setAddingSubtask(false); setNewSubtaskTitle('') }}>
                  Отмена
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Комментарии */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Комментарии {comments.length > 0 && `(${comments.length})`}
            </Typography>

            {commentsLoading ? (
              <CircularProgress size={20} />
            ) : comments.length === 0 ? (
              <Typography variant="caption" color="text.disabled">Комментариев нет. Будьте первым!</Typography>
            ) : (
              <List disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {comments.map((c) => (
                  <ListItem key={c.id} alignItems="flex-start" disablePadding sx={{ mb: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'secondary.main' }}>
                        {c.user.first_name?.[0] ?? '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="caption" fontWeight={600}>
                            {c.user.first_name} {c.user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {format(new Date(c.created_at), 'd MMM, HH:mm', { locale: ru })}
                          </Typography>
                          {c.user_id === currentUserId && (
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small" sx={{ p: 0.2, ml: 'auto' }}
                                onClick={() => deleteComment({ taskId: task.id, commentId: c.id })}
                              >
                                <DeleteIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', mt: 0.25 }}>
                          {c.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                <div ref={commentsEndRef} />
              </List>
            )}

            {/* Поле ввода комментария */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2 }}>
              <TextField
                size="small"
                multiline
                maxRows={3}
                placeholder="Написать комментарий…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                sx={{ flex: 1 }}
              />
              <Tooltip title="Отправить (Enter)">
                <span>
                  <IconButton
                    color="primary"
                    onClick={handleSendComment}
                    disabled={!commentText.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <TaskForm open={editOpen} onClose={() => setEditOpen(false)} task={task} />
    </>
  )
}
