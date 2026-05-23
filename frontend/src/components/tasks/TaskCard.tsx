import { useState } from 'react'
import {
  Card, CardContent, Typography, Chip, Box, IconButton, Tooltip,
  Avatar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import CommentIcon from '@mui/icons-material/Comment'
import EventIcon from '@mui/icons-material/Event'
import type { Task } from '../../types'
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../types'
import { useDeleteTaskMutation } from '../../api/tasksApi'
import TaskForm from './TaskForm'
import TaskDetailModal from './TaskDetailModal'
import SubtaskChecklist from './SubtaskChecklist'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { googleCalendarUrl } from '../../utils/calendarUtils'

interface Props {
  task: Task
  compact?: boolean
}

export default function TaskCard({ task, compact }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteTask] = useDeleteTaskMutation()

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 1, cursor: 'pointer', minWidth: 0, '&:hover': { boxShadow: 2 } }}
        onClick={() => setDetailOpen(true)}
      >
        <CardContent sx={{ pb: '8px !important', pt: 1.5, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              {task.title}
            </Typography>
            {!compact && (
              <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', flexShrink: 0 }}>
                <IconButton size="small" onClick={() => setEditOpen(true)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => deleteTask(task.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            )}
          </Box>

          {task.description && !compact && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, overflowWrap: 'anywhere' }}>
              {task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            <Chip
              label={TASK_PRIORITY_LABELS[task.priority]}
              size="small"
              sx={{ bgcolor: TASK_PRIORITY_COLORS[task.priority], color: '#fff', fontSize: 10, height: 18 }}
            />
            {!compact && (
              <Chip
                label={TASK_STATUS_LABELS[task.status]}
                size="small"
                sx={{ bgcolor: TASK_STATUS_COLORS[task.status], color: '#fff', fontSize: 10, height: 18 }}
              />
            )}
            {task.tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" sx={{ bgcolor: tag.color, color: '#fff', fontSize: 10, height: 18 }} />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 1, gap: 1.5 }}>
            {task.due_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color={new Date(task.due_date) < new Date() ? 'error' : 'text.secondary'}>
                  📅 {format(new Date(task.due_date), 'd MMM', { locale: ru })}
                </Typography>
                <Tooltip title="Добавить в Google Calendar">
                  <IconButton
                    size="small"
                    component="a"
                    href={googleCalendarUrl(task)}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ p: 0.2, color: 'text.secondary', '&:hover': { color: '#4285f4' } }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EventIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {task.subtasks_count > 0 && !compact && (
              <Tooltip title="Подзадачи">
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <SubdirectoryArrowRightIcon fontSize="inherit" /> {task.subtasks_count}
                </Typography>
              </Tooltip>
            )}
            {task.comments_count > 0 && (
              <Tooltip title="Комментарии">
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <CommentIcon fontSize="inherit" /> {task.comments_count}
                </Typography>
              </Tooltip>
            )}
            {task.assignee && (
              <Tooltip title={`${task.assignee.first_name} ${task.assignee.last_name}`}>
                <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'primary.main' }}>
                  {task.assignee.first_name[0]}
                </Avatar>
              </Tooltip>
            )}
          </Box>
          {compact && task.subtasks_count > 0 && (
            <SubtaskChecklist taskId={task.id} />
          )}
        </CardContent>
      </Card>

      <TaskForm open={editOpen} onClose={() => setEditOpen(false)} task={task} />
      <TaskDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} task={task} />
    </>
  )
}
