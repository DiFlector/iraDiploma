import { useState } from 'react'
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, IconButton, Chip,
  CircularProgress, Paper, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import LabelIcon from '@mui/icons-material/Label'
import { useGetTagsQuery, useCreateTagMutation, useDeleteTagMutation } from '../api/projectsApi'

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  '#0ea5e9', '#d946ef', '#14b8a6', '#fb923c', '#a3e635',
]

export default function TagsPage() {
  const { data: tags = [], isLoading } = useGetTagsQuery()
  const [createTag] = useCreateTagMutation()
  const [deleteTag] = useDeleteTagMutation()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return
    await createTag({ name: name.trim(), color })
    setName('')
    setColor(PRESET_COLORS[0])
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setName('')
    setColor(PRESET_COLORS[0])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Метки</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Новая метка
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : tags.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <LabelIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary" gutterBottom>Меток пока нет</Typography>
          <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setOpen(true)}>
            Создать первую метку
          </Button>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ maxWidth: 520 }}>
          <List disablePadding>
            {tags.map((tag, i) => (
              <ListItem
                key={tag.id}
                divider={i < tags.length - 1}
                sx={{ py: 1.5, gap: 2 }}
                secondaryAction={
                  <Tooltip title="Удалить метку">
                    <IconButton
                      edge="end"
                      color="error"
                      size="small"
                      onClick={() => setConfirmDelete(tag.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Chip
                  label={tag.name}
                  size="small"
                  sx={{ bgcolor: tag.color, color: '#fff', fontWeight: 600, minWidth: 80 }}
                />
                <ListItemText
                  primary={tag.name}
                  secondary={tag.color.toUpperCase()}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 11, fontFamily: 'monospace' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Диалог создания */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Новая метка</DialogTitle>
        <DialogContent>
          <TextField
            label="Название"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            sx={{ mt: 1, mb: 2.5 }}
            autoFocus
            inputProps={{ maxLength: 50 }}
          />

          <Typography variant="body2" fontWeight={500} gutterBottom>
            Цвет
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 30, height: 30, borderRadius: '50%', bgcolor: c,
                  cursor: 'pointer',
                  border: color === c ? '3px solid' : '3px solid transparent',
                  borderColor: color === c ? 'text.primary' : 'transparent',
                  outline: color === c ? '2px solid white' : 'none',
                  outlineOffset: '-4px',
                  transition: 'transform 0.12s',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Произвольный цвет:</Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 40, height: 40, border: '1px solid #ccc',
                borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none',
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>Предпросмотр:</Typography>
            <Chip
              label={name || 'Название метки'}
              sx={{ bgcolor: color, color: '#fff', fontWeight: 600 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!name.trim()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления */}
      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} maxWidth="xs">
        <DialogTitle>Удалить метку?</DialogTitle>
        <DialogContent>
          <Typography>
            Метка будет удалена со всех задач. Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (confirmDelete) await deleteTag(confirmDelete)
              setConfirmDelete(null)
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
