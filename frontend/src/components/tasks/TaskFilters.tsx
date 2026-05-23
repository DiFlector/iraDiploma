import { Box, TextField, MenuItem, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { TaskStatus, TaskPriority } from '../../types'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../types'
import { useGetProjectsQuery } from '../../api/projectsApi'

interface Filters {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  project_id: string
}

interface Props {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
}

const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'review', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

export default function TaskFilters({ filters, onChange }: Props) {
  const { data: projects = [] } = useGetProjectsQuery()

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
      <TextField
        size="small" placeholder="Поиск..." value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ minWidth: { xs: '100%', sm: 200 }, flex: { xs: '1 1 100%', sm: '0 1 260px' } }}
      />
      <TextField select size="small" label="Статус" value={filters.status} onChange={(e) => onChange({ status: e.target.value as TaskStatus | '' })} sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: '1 1 100%', sm: '0 1 170px' } }}>
        <MenuItem value="">Все статусы</MenuItem>
        {STATUSES.map((s) => <MenuItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Приоритет" value={filters.priority} onChange={(e) => onChange({ priority: e.target.value as TaskPriority | '' })} sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { xs: '1 1 100%', sm: '0 1 170px' } }}>
        <MenuItem value="">Все приоритеты</MenuItem>
        {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</MenuItem>)}
      </TextField>
      <TextField select size="small" label="Проект" value={filters.project_id} onChange={(e) => onChange({ project_id: e.target.value })} sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { xs: '1 1 100%', sm: '0 1 190px' } }}>
        <MenuItem value="">Все проекты</MenuItem>
        {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
      </TextField>
    </Box>
  )
}
