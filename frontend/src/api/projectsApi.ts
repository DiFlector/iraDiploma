import { baseApi } from './baseApi'
import type { Project, ProjectRole, Tag } from '../types'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: build.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),
    createProject: build.mutation<Project, { name: string; description?: string }>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateProject: build.mutation<Project, { id: string; name?: string; description?: string }>({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: build.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
    inviteMember: build.mutation<Project, { projectId: string; email: string; role: ProjectRole }>({
      query: ({ projectId, ...body }) => ({ url: `/projects/${projectId}/members`, method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateMemberRole: build.mutation<Project, { projectId: string; userId: string; role: ProjectRole }>({
      query: ({ projectId, userId, role }) => ({ url: `/projects/${projectId}/members/${userId}`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['Project'],
    }),
    removeMember: build.mutation<void, { projectId: string; userId: string }>({
      query: ({ projectId, userId }) => ({ url: `/projects/${projectId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
    getTags: build.query<Tag[], void>({
      query: () => '/tags',
      providesTags: ['Tag'],
    }),
    createTag: build.mutation<Tag, { name: string; color: string }>({
      query: (body) => ({ url: '/tags', method: 'POST', body }),
      invalidatesTags: ['Tag'],
    }),
    updateTag: build.mutation<Tag, { id: string; name?: string; color?: string }>({
      query: ({ id, ...body }) => ({ url: `/tags/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Tag'],
    }),
    deleteTag: build.mutation<void, string>({
      query: (id) => ({ url: `/tags/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Tag'],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = projectsApi
