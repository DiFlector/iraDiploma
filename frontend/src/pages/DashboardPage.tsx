import { useState } from 'react'
import { Box, Button, Typography, CircularProgress, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TaskCard from '../components/tasks/TaskCard'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskForm from '../components/tasks/TaskForm'
import { useGetTasksQuery } from '../api/tasksApi'
import type { TaskStatus, TaskPriority } from '../types'
import { exportToCalendar } from '../utils/calendarUtils'

interface Filters {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  project_id: string
}

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', priority: '', project_id: '' })

  const queryParams = {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.project_id ? { project_id: filters.project_id } : {}),
  }

  const { data: tasks = [], isLoading } = useGetTasksQuery(queryParams)

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5">Мои задачи</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
          <Tooltip title={
            tasks.filter((t) => t.due_date).length === 0
              ? 'Нет задач с датой дедлайна'
              : 'Скачать .ics для импорта в Google Calendar'
          }>
            <span>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => exportToCalendar(tasks)}
                disabled={tasks.filter((t) => t.due_date).length === 0}
              >
                Экспорт в календарь
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Новая задача
          </Button>
        </Box>
      </Box>

      <TaskFilters filters={filters} onChange={(partial) => setFilters((f) => ({ ...f, ...partial }))} />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography color="text.secondary">Задач не найдено</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setCreateOpen(true)}>Создать первую задачу</Button>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 720, width: '100%', minWidth: 0 }}>
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </Box>
      )}

      <TaskForm open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  )
}
