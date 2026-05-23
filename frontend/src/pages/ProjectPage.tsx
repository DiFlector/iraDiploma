import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, Chip, CircularProgress, Divider, List, ListItem,
  ListItemAvatar, Avatar, ListItemText, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import { useGetProjectQuery, useInviteMemberMutation, useUpdateMemberRoleMutation, useRemoveMemberMutation } from '../api/projectsApi'
import { useGetTasksQuery } from '../api/tasksApi'
import { useAppSelector } from '../store'
import type { ProjectRole } from '../types'
import AddIcon from '@mui/icons-material/Add'

const ROLES: ProjectRole[] = ['admin', 'editor', 'viewer']
const ROLE_LABELS: Record<ProjectRole, string> = { admin: 'Администратор', editor: 'Редактор', viewer: 'Читатель' }

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const currentUserId = useAppSelector((s) => s.auth.user?.id)
  const { data: project, isLoading } = useGetProjectQuery(id!)
  const { data: tasks = [] } = useGetTasksQuery({ project_id: id })
  const [inviteMember] = useInviteMemberMutation()
  const [updateRole] = useUpdateMemberRoleMutation()
  const [removeMember] = useRemoveMemberMutation()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ProjectRole>('editor')
  const [taskOpen, setTaskOpen] = useState(false)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!project) return <Typography>Проект не найден</Typography>

  const isAdmin = project.members.find((m) => m.user_id === currentUserId)?.role === 'admin'

  const handleInvite = async () => {
    if (!email.trim()) return
    await inviteMember({ projectId: project.id, email: email.trim(), role })
    setEmail('')
    setInviteOpen(false)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 1 }}>
        <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>{project.name}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTaskOpen(true)}>Задача</Button>
      </Box>
      {project.description && <Typography color="text.secondary" mb={2} sx={{ overflowWrap: 'anywhere' }}>{project.description}</Typography>}

      <Typography variant="h6" mb={1} mt={2}>Участники</Typography>
      <List dense>
        {project.members.map((m) => (
          <ListItem key={m.user_id} sx={{ pr: { xs: 0, sm: 16 }, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'flex-start', '& .MuiListItemSecondaryAction-root': { position: { xs: 'static', sm: 'absolute' }, transform: { xs: 'none', sm: 'translateY(-50%)' }, width: { xs: '100%', sm: 'auto' }, mt: { xs: 1, sm: 0 } } }} secondaryAction={
            isAdmin && m.user_id !== currentUserId ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                <TextField select size="small" value={m.role} onChange={(e) => updateRole({ projectId: project.id, userId: m.user_id, role: e.target.value as ProjectRole })} sx={{ minWidth: 120, flex: { xs: 1, sm: 'initial' } }}>
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
                </TextField>
                <Button size="small" color="error" onClick={() => removeMember({ projectId: project.id, userId: m.user_id })}>Удалить</Button>
              </Box>
            ) : (
              <Chip label={ROLE_LABELS[m.role]} size="small" />
            )
          }>
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12 }}>
                {m.user.first_name[0]}{m.user.last_name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${m.user.first_name} ${m.user.last_name}`} primaryTypographyProps={{ sx: { overflowWrap: 'anywhere' } }} />
          </ListItem>
        ))}
      </List>

      {isAdmin && (
        <Button startIcon={<PersonAddIcon />} size="small" onClick={() => setInviteOpen(true)} sx={{ mb: 2 }}>
          Пригласить участника
        </Button>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" mb={1}>Задачи проекта ({tasks.length})</Typography>
      <Box sx={{ maxWidth: 720, width: '100%', minWidth: 0 }}>
        {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        {tasks.length === 0 && <Typography color="text.secondary">Задач нет</Typography>}
      </Box>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: '100%' } } }}>
        <DialogTitle>Пригласить участника</DialogTitle>
        <DialogContent>
          <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField select label="Роль" fullWidth margin="normal" value={role} onChange={(e) => setRole(e.target.value as ProjectRole)}>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleInvite}>Пригласить</Button>
        </DialogActions>
      </Dialog>

      <TaskForm open={taskOpen} onClose={() => setTaskOpen(false)} defaultProjectId={project.id} />
    </Box>
  )
}
