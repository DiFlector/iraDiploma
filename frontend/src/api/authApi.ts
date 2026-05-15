import { baseApi } from './baseApi'
import type { TokenResponse, User } from '../types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<TokenResponse, { email: string; password: string; first_name: string; last_name: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: build.mutation<TokenResponse, { username: string; password: string }>({
      query: (body) => {
        const form = new URLSearchParams()
        form.append('username', body.username)
        form.append('password', body.password)
        return { url: '/auth/login', method: 'POST', body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      },
    }),
    getMe: build.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: build.mutation<User, { first_name?: string; last_name?: string; avatar_url?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: build.mutation<{ message: string }, { token: string; new_password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    changePassword: build.mutation<{ message: string }, { current_password: string; new_password: string }>({
      query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }),
    }),
    uploadAvatar: build.mutation<User, FormData>({
      query: (formData) => ({ url: '/users/me/avatar', method: 'POST', body: formData }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
} = authApi
