import { Checkbox, Box, Typography, LinearProgress } from '@mui/material'
import { useGetSubtasksQuery, useUpdateTaskStatusMutation } from '../../api/tasksApi'

interface Props {
  taskId: string
}

export default function SubtaskChecklist({ taskId }: Props) {
  const { data: subtasks = [], isLoading } = useGetSubtasksQuery(taskId)
  const [updateStatus] = useUpdateTaskStatusMutation()

  if (isLoading) return <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
  if (subtasks.length === 0) return null

  const doneCount = subtasks.filter((s) => s.status === 'done').length
  const progress = Math.round((doneCount / subtasks.length) * 100)

  return (
    <Box
      sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}
      onClick={(e) => e.stopPropagation()}  // не открываем TaskDetail при клике на чекбокс
    >
      {/* Прогресс-бар */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ flex: 1, height: 4, borderRadius: 2 }}
          color={progress === 100 ? 'success' : 'primary'}
        />
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, whiteSpace: 'nowrap' }}>
          {doneCount}/{subtasks.length}
        </Typography>
      </Box>

      {/* Список чекбоксов */}
      {subtasks.map((s) => (
        <Box
          key={s.id}
          sx={{ display: 'flex', alignItems: 'flex-start', py: 0.15, gap: 0.25 }}
        >
          <Checkbox
            size="small"
            checked={s.status === 'done'}
            onChange={() =>
              updateStatus({ id: s.id, status: s.status === 'done' ? 'to_do' : 'done' })
            }
            sx={{ p: 0.25, mt: '-1px' }}
          />
          <Typography
            variant="caption"
            sx={{
              lineHeight: 1.4,
              mt: '3px',
              textDecoration: s.status === 'done' ? 'line-through' : 'none',
              color: s.status === 'done' ? 'text.disabled' : 'text.secondary',
            }}
          >
            {s.title}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
