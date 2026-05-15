import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useAppDispatch } from '../store'
import { setCredentials } from '../features/auth/authSlice'
import { useLoginMutation } from '../api/authApi'

interface FormData { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await login({ username: data.email, password: data.password }).unwrap()
      dispatch(setCredentials(res))
      navigate('/dashboard')
    } catch {
      setError('Неверный email или пароль')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={3} color="primary">TaskApp</Typography>
          <Typography variant="h6" mb={2}>Вход</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email" fullWidth margin="normal" type="email"
              error={!!errors.email} helperText={errors.email?.message}
              {...register('email', { required: 'Введите email' })}
            />
            <TextField
              label="Пароль" fullWidth margin="normal" type="password"
              error={!!errors.password} helperText={errors.password?.message}
              {...register('password', { required: 'Введите пароль' })}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, py: 1.5 }} disabled={isLoading}>
              {isLoading ? 'Входим...' : 'Войти'}
            </Button>
          </form>
          <Typography textAlign="center" mt={2} variant="body2">
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register">Зарегистрироваться</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
