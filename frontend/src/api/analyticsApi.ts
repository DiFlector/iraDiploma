import { baseApi } from './baseApi'
import type { CompletionStats, StatusDistribution, ProjectProgress } from '../types'

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompletion: build.query<CompletionStats, { period?: string }>({
      query: (params) => ({ url: '/analytics/completion', params }),
    }),
    getStatusDistribution: build.query<StatusDistribution[], { project_id?: string }>({
      query: (params) => ({ url: '/analytics/status-distribution', params }),
    }),
    getProjectProgress: build.query<ProjectProgress, string>({
      query: (projectId) => `/analytics/project-progress/${projectId}`,
    }),
  }),
})

export const { useGetCompletionQuery, useGetStatusDistributionQuery, useGetProjectProgressQuery } = analyticsApi
