import { baseApi } from './baseApi'
import type { Task, Comment, TaskStatus, TaskPriority } from '../types'

interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  project_id?: string
  assignee_id?: string
  search?: string
  include_deleted?: boolean
  skip?: number
  limit?: number
}

interface TaskCreate {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  project_id?: string
  assignee_id?: string
  parent_task_id?: string
  tag_ids?: string[]
}

interface TaskUpdate extends Partial<TaskCreate> {}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], TaskFilters>({
      query: (params) => ({ url: '/tasks', params }),
      providesTags: ['Task'],
    }),
    getTask: build.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Task', id }],
    }),
    createTask: build.mutation<Task, TaskCreate>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: ['Task'],
    }),
    updateTask: build.mutation<Task, { id: string } & TaskUpdate>({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Task', id }, 'Task'],
    }),
    updateTaskStatus: build.mutation<Task, { id: string; status: TaskStatus }>({
      query: ({ id, status }) => ({ url: `/tasks/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: build.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Task'],
    }),
    restoreTask: build.mutation<Task, string>({
      query: (id) => ({ url: `/tasks/${id}/restore`, method: 'POST' }),
      invalidatesTags: ['Task'],
    }),
    getSubtasks: build.query<Task[], string>({
      query: (id) => `/tasks/${id}/subtasks`,
      providesTags: ['Task'],
    }),
    getComments: build.query<Comment[], string>({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: (_r, _e, taskId) => [{ type: 'Task', id: `comments-${taskId}` }],
    }),
    createComment: build.mutation<Comment, { taskId: string; content: string }>({
      query: ({ taskId, content }) => ({ url: `/tasks/${taskId}/comments`, method: 'POST', body: { content } }),
      invalidatesTags: (_r, _e, { taskId }) => [{ type: 'Task', id: `comments-${taskId}` }],
    }),
    deleteComment: build.mutation<void, { taskId: string; commentId: string }>({
      query: ({ taskId, commentId }) => ({ url: `/tasks/${taskId}/comments/${commentId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { taskId }) => [{ type: 'Task', id: `comments-${taskId}` }],
    }),
    attachTag: build.mutation<void, { taskId: string; tagId: string }>({
      query: ({ taskId, tagId }) => ({ url: `/tasks/${taskId}/tags/${tagId}`, method: 'POST' }),
      invalidatesTags: ['Task'],
    }),
    detachTag: build.mutation<void, { taskId: string; tagId: string }>({
      query: ({ taskId, tagId }) => ({ url: `/tasks/${taskId}/tags/${tagId}`, method: 'DELETE' }),
      invalidatesTags: ['Task'],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useRestoreTaskMutation,
  useGetSubtasksQuery,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useAttachTagMutation,
  useDetachTagMutation,
} = tasksApi
