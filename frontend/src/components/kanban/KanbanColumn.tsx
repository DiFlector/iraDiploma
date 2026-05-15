import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Box, Typography, Chip } from '@mui/material'
import type { Task, TaskStatus } from '../../types'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../../types'
import KanbanCard from './KanbanCard'

interface Props {
  status: TaskStatus
  tasks: Task[]
}

export default function KanbanColumn({ status, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <Box sx={{ flex: 1, minWidth: 240, maxWidth: 300 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>{TASK_STATUS_LABELS[status]}</Typography>
        <Chip label={tasks.length} size="small" sx={{ height: 18, fontSize: 11, bgcolor: TASK_STATUS_COLORS[status], color: '#fff' }} />
      </Box>
      <Box
        ref={setNodeRef}
        sx={{
          bgcolor: isOver ? 'action.hover' : 'background.default',
          borderRadius: 2, p: 1,
          minHeight: 100,
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => <KanbanCard key={task.id} task={task} />)}
        </SortableContext>
      </Box>
    </Box>
  )
}
