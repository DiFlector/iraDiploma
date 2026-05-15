import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
}

const token = localStorage.getItem('access_token')
const refreshToken = localStorage.getItem('refresh_token')

const initialState: AuthState = {
  token,
  refreshToken,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ access_token: string; refresh_token: string }>) {
      state.token = action.payload.access_token
      state.refreshToken = action.payload.refresh_token
      localStorage.setItem('access_token', action.payload.access_token)
      localStorage.setItem('refresh_token', action.payload.refresh_token)
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    logout(state) {
      state.token = null
      state.refreshToken = null
      state.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
