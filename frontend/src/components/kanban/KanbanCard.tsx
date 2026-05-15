import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box } from '@mui/material'
import type { Task } from '../../types'
import TaskCard from '../tasks/TaskCard'

interface Props {
  task: Task
  /** Рендерится внутри DragOverlay — следует за курсором, без drag-логики */
  overlay?: boolean
}

export default function KanbanCard({ task, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  // Вариант «призрака» в оверлее: слегка приподнят и повёрнут
  if (overlay) {
    return (
      <Box sx={{ cursor: 'grabbing', transform: 'rotate(1.5deg)', boxShadow: 8, borderRadius: 1 }}>
        <TaskCard task={task} compact />
      </Box>
    )
  }

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      sx={{
        opacity: isDragging ? 0 : 1,
        cursor: 'grab',
        // Drag-listeners только на обёртке, не на контенте карточки
        '& > *': { pointerEvents: isDragging ? 'none' : 'auto' },
      }}
    >
      {/* drag-handle: весь блок, но TaskCard перехватывает клики через stopPropagation */}
      <Box {...listeners} sx={{ cursor: 'grab' }}>
        <TaskCard task={task} compact />
      </Box>
    </Box>
  )
}
