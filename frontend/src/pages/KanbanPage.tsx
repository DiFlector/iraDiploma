import { useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent,
  DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { Box, Typography, Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import KanbanColumn from '../components/kanban/KanbanColumn'
import KanbanCard from '../components/kanban/KanbanCard'
import TaskForm from '../components/tasks/TaskForm'
import { useGetTasksQuery, useUpdateTaskStatusMutation } from '../api/tasksApi'
import type { Task, TaskStatus } from '../types'

const COLUMNS: TaskStatus[] = ['to_do', 'in_progress', 'review', 'done']

export default function KanbanPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<TaskStatus>('to_do')
  const { data: tasks = [], isLoading } = useGetTasksQuery({})
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dragError, setDragError] = useState(false)

  // activationConstraint: distance 5px — чтобы клик по карточке не начинал drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const tasksByStatus = COLUMNS.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s && !t.deleted_at)
    return acc
  }, {} as Record<TaskStatus, typeof tasks>)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    // over.id может быть ID колонки (статус) или ID другой карточки
    let newStatus = over.id as TaskStatus
    if (!COLUMNS.includes(newStatus)) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) newStatus = overTask.status
      else return
    }
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      try {
        await updateStatus({ id: taskId, status: newStatus }).unwrap()
      } catch {
        setDragError(true)
      }
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5">Kanban</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCreateStatus('to_do'); setCreateOpen(true) }}>
          Новая задача
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: { xs: 'minmax(260px, 82vw)', sm: 'minmax(240px, 1fr)' }, gap: 2, overflowX: 'auto', overflowY: 'hidden', pb: 2, width: '100%', minWidth: 0 }}>
            {COLUMNS.map((status) => (
              <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} />
            ))}
          </Box>

          {/* DragOverlay рендерит «призрак» карточки поверх всего — следует за курсором */}
          <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeTask ? <KanbanCard task={activeTask} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskForm open={createOpen} onClose={() => setCreateOpen(false)} defaultStatus={createStatus} />

      <Snackbar open={dragError} autoHideDuration={4000} onClose={() => setDragError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setDragError(false)}>
          Не удалось переместить задачу. Проверьте соединение.
        </Alert>
      </Snackbar>
    </Box>
  )
}
