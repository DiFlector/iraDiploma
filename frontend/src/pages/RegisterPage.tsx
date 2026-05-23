import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useAppDispatch } from '../store'
import { setCredentials } from '../features/auth/authSlice'
import { useRegisterMutation } from '../api/authApi'

interface FormData { email: string; password: string; first_name: string; last_name: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [register, { isLoading }] = useRegisterMutation()
  const [error, setError] = useState('')
  const { register: reg, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await register(data).unwrap()
      dispatch(setCredentials(res))
      navigate('/dashboard')
    } catch (e: any) {
      setError(e?.data?.detail || 'Ошибка регистрации')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440, p: { xs: 1, sm: 2 } }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={3} color="primary">TaskApp</Typography>
          <Typography variant="h6" mb={2}>Регистрация</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField label="Имя" fullWidth margin="dense"
                  error={!!errors.first_name} helperText={errors.first_name?.message}
                  {...reg('first_name', { required: 'Введите имя' })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Фамилия" fullWidth margin="dense"
                  error={!!errors.last_name} helperText={errors.last_name?.message}
                  {...reg('last_name', { required: 'Введите фамилию' })} />
              </Grid>
            </Grid>
            <TextField label="Email" fullWidth margin="normal" type="email"
              error={!!errors.email} helperText={errors.email?.message}
              {...reg('email', { required: 'Введите email' })} />
            <TextField label="Пароль" fullWidth margin="normal" type="password"
              error={!!errors.password} helperText={errors.password?.message}
              {...reg('password', { required: 'Введите пароль', minLength: { value: 6, message: 'Минимум 6 символов' } })} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, py: 1.5 }} disabled={isLoading}>
              {isLoading ? 'Создаём...' : 'Зарегистрироваться'}
            </Button>
          </form>
          <Typography textAlign="center" mt={2} variant="body2">
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login">Войти</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
