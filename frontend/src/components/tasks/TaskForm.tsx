import { useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Grid, Autocomplete, Chip,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import type { Task, TaskStatus, TaskPriority } from '../../types'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '../../types'
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../api/tasksApi'
import { useGetProjectsQuery } from '../../api/projectsApi'
import { useGetTagsQuery } from '../../api/projectsApi'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
  defaultProjectId?: string
  defaultStatus?: TaskStatus
}

interface FormData {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  project_id: string
  tag_ids: string[]
}

const STATUSES: TaskStatus[] = ['to_do', 'in_progress', 'review', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']

export default function TaskForm({ open, onClose, task, defaultProjectId, defaultStatus }: Props) {
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const { data: projects = [] } = useGetProjectsQuery()
  const { data: tags = [] } = useGetTagsQuery()

  const { control, handleSubmit, reset, register, watch } = useForm<FormData>({
    defaultValues: {
      title: '', description: '', status: defaultStatus || 'to_do',
      priority: 'medium', due_date: '', project_id: defaultProjectId || '', tag_ids: [],
    },
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
        project_id: task.project_id || '',
        tag_ids: task.tags.map((t) => t.id),
      })
    } else {
      reset({ title: '', description: '', status: defaultStatus || 'to_do', priority: 'medium', due_date: '', project_id: defaultProjectId || '', tag_ids: [] })
    }
  }, [task, open, reset, defaultProjectId, defaultStatus])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      project_id: data.project_id || undefined,
    }
    if (task) {
      await updateTask({ id: task.id, ...payload })
    } else {
      await createTask(payload)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task ? 'Редактировать задачу' : 'Новая задача'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Название *" fullWidth {...register('title', { required: true })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Описание" fullWidth multiline rows={3} {...register('description')} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField select label="Статус" fullWidth {...field}>
                  {STATUSES.map((s) => <MenuItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="priority" control={control} render={({ field }) => (
                <TextField select label="Приоритет" fullWidth {...field}>
                  {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Срок" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} {...register('due_date')} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="project_id" control={control} render={({ field }) => (
                <TextField select label="Проект" fullWidth {...field}>
                  <MenuItem value="">— Без проекта —</MenuItem>
                  {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="tag_ids" control={control} render={({ field }) => (
                <Autocomplete
                  multiple
                  options={tags}
                  getOptionLabel={(t) => t.name}
                  value={tags.filter((t) => field.value.includes(t.id))}
                  onChange={(_, v) => field.onChange(v.map((t) => t.id))}
                  renderTags={(val, getTagProps) =>
                    val.map((tag, i) => {
                      const { key, ...tagProps } = getTagProps({ index: i })
                      return <Chip key={key} label={tag.name} size="small" sx={{ bgcolor: tag.color, color: '#fff' }} {...tagProps} />
                    })
                  }
                  renderInput={(params) => <TextField {...params} label="Метки" />}
                />
              )} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">{task ? 'Сохранить' : 'Создать'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
