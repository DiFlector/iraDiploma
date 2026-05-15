import { baseApi } from './baseApi'
import type { Notification } from '../types'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<Notification[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markRead: build.mutation<Notification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: build.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } = notificationsApi
