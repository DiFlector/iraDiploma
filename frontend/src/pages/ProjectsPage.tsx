import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActionArea,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import DeleteIcon from '@mui/icons-material/Delete'
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '../api/projectsApi'
import { useAppSelector } from '../store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const currentUserId = useAppSelector((s) => s.auth.user?.id)
  const { data: projects = [], isLoading } = useGetProjectsQuery()
  const [createProject] = useCreateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) return
    await createProject({ name: name.trim(), description: description || undefined })
    setName('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5">Проекты</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Новый проект</Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <FolderIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography color="text.secondary" mt={1}>Нет проектов</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpen(true)}>Создать первый проект</Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>{project.name}</Typography>
                      {project.owner_id === currentUserId && (
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {project.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ overflowWrap: 'anywhere' }}>
                        {project.description.slice(0, 80)}{project.description.length > 80 ? '…' : ''}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                      {project.members.length} участников · Создан {format(new Date(project.created_at), 'd MMM yyyy', { locale: ru })}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1.5, sm: 4 }, width: { xs: 'calc(100% - 24px)', sm: '100%' } } }}>
        <DialogTitle>Новый проект</DialogTitle>
        <DialogContent>
          <TextField label="Название *" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Описание" fullWidth margin="normal" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim()}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
