import { useState, useRef } from 'react'
import {
  Box, Typography, Paper, TextField, Button, Avatar, Divider,
  Alert, CircularProgress, Stack, IconButton, Tooltip, Badge,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useForm } from 'react-hook-form'
import { useAppSelector, useAppDispatch } from '../store'
import { setUser } from '../features/auth/authSlice'
import { useGetMeQuery, useUpdateMeMutation, useChangePasswordMutation, useUploadAvatarMutation } from '../api/authApi'

interface ProfileForm {
  first_name: string
  last_name: string
}

interface PasswordForm {
  current_password: string
  new_password: string
  confirm_password: string
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { data: me, isLoading } = useGetMeQuery()
  const [updateMe] = useUpdateMeMutation()
  const [changePassword] = useChangePasswordMutation()
  const [uploadAvatar, { isLoading: avatarLoading }] = useUploadAvatarMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { register: regProfile, handleSubmit: handleProfile, formState: { isDirty: profileDirty } } = useForm<ProfileForm>({
    values: { first_name: me?.first_name ?? '', last_name: me?.last_name ?? '' },
  })

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, watch } = useForm<PasswordForm>({
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  })
  const newPwd = watch('new_password')

  // Выбор файла — показываем превью и сразу загружаем
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Локальное превью
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Загрузка на сервер
    const formData = new FormData()
    formData.append('file', file)
    try {
      const updated = await uploadAvatar(formData).unwrap()
      dispatch(setUser(updated))
      setProfileMsg({ type: 'success', text: 'Аватар обновлён' })
    } catch {
      setAvatarPreview(null)
      setProfileMsg({ type: 'error', text: 'Ошибка загрузки аватара' })
    }
    // сбрасываем input чтобы можно было выбрать тот же файл повторно
    e.target.value = ''
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const updated = await updateMe(data).unwrap()
      dispatch(setUser(updated))
      setProfileMsg({ type: 'success', text: 'Профиль обновлён' })
    } catch {
      setProfileMsg({ type: 'error', text: 'Ошибка при сохранении' })
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.new_password !== data.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'Новые пароли не совпадают' })
      return
    }
    try {
      await changePassword({ current_password: data.current_password, new_password: data.new_password }).unwrap()
      setPasswordMsg({ type: 'success', text: 'Пароль успешно изменён' })
      resetPassword()
    } catch (e: any) {
      setPasswordMsg({ type: 'error', text: e?.data?.detail ?? 'Ошибка при смене пароля' })
    }
  }

  // Источник аватара: превью → URL с сервера (/static/... проксируется nginx) → инициалы
  const avatarSrc = avatarPreview ?? (me?.avatar_url ?? undefined)
  const initials = me ? (`${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}` || '?') : '?'

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ maxWidth: 560, width: '100%', minWidth: 0 }}>
      <Typography variant="h5" gutterBottom>Профиль</Typography>

      {/* Аватар + email */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 3 } }}>
        <Tooltip title="Нажмите для смены аватара">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                sx={{ bgcolor: 'primary.main', color: '#fff', width: 26, height: 26, '&:hover': { bgcolor: 'primary.dark' } }}
              >
                {avatarLoading ? <CircularProgress size={12} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            }
          >
            <Avatar
              src={avatarSrc}
              onClick={() => fileInputRef.current?.click()}
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            >
              {!avatarSrc && initials}
            </Avatar>
          </Badge>
        </Tooltip>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>{me?.first_name} {me?.last_name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{me?.email}</Typography>
          <Typography variant="caption" color="text.disabled">
            Зарегистрирован: {me ? new Date(me.created_at).toLocaleDateString('ru-RU') : '—'}
          </Typography>
        </Box>

        {/* Скрытый input для выбора файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Paper>

      {/* Редактирование имени */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>Личные данные</Typography>
        </Stack>

        {profileMsg && (
          <Alert severity={profileMsg.type} sx={{ mb: 2 }} onClose={() => setProfileMsg(null)}>
            {profileMsg.text}
          </Alert>
        )}

        <form onSubmit={handleProfile(onProfileSubmit)}>
          <Stack spacing={2}>
            <TextField label="Имя" fullWidth {...regProfile('first_name', { required: true })} />
            <TextField label="Фамилия" fullWidth {...regProfile('last_name', { required: true })} />
            <Button type="submit" variant="contained" disabled={!profileDirty} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
              Сохранить
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Смена пароля */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LockIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>Смена пароля</Typography>
        </Stack>

        {passwordMsg && (
          <Alert severity={passwordMsg.type} sx={{ mb: 2 }} onClose={() => setPasswordMsg(null)}>
            {passwordMsg.text}
          </Alert>
        )}

        <form onSubmit={handlePassword(onPasswordSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Текущий пароль"
              type="password"
              fullWidth
              {...regPassword('current_password', { required: true })}
            />
            <TextField
              label="Новый пароль"
              type="password"
              fullWidth
              {...regPassword('new_password', { required: true, minLength: { value: 6, message: 'Минимум 6 символов' } })}
            />
            <TextField
              label="Повторите новый пароль"
              type="password"
              fullWidth
              error={!!watch('confirm_password') && watch('confirm_password') !== newPwd}
              helperText={watch('confirm_password') && watch('confirm_password') !== newPwd ? 'Пароли не совпадают' : ''}
              {...regPassword('confirm_password', { required: true })}
            />
            <Button type="submit" variant="contained" sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
              Изменить пароль
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}
