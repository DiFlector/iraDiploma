export type TaskStatus = 'to_do' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type ProjectRole = 'admin' | 'editor' | 'viewer'
export type NotificationType = 'deadline' | 'assignment' | 'comment'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserShort {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
}

export interface Tag {
  id: string
  name: string
  color: string
  user_id: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  creator_id: string
  assignee_id: string | null
  project_id: string | null
  parent_task_id: string | null
  creator: UserShort
  assignee: UserShort | null
  tags: Tag[]
  subtasks_count: number
  comments_count: number
}

export interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  task_id: string
  user_id: string
  user: UserShort
}

export interface ProjectMember {
  user_id: string
  role: ProjectRole
  user: UserShort
}

export interface Project {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
  members: ProjectMember[]
}

export interface Notification {
  id: string
  type: NotificationType
  content: string
  is_read: boolean
  created_at: string
  task_id: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface DailyCount {
  date: string
  count: number
}

export interface CompletionStats {
  period: string
  data: DailyCount[]
}

export interface StatusDistribution {
  status: TaskStatus
  count: number
}

export interface ProjectProgress {
  project_id: string
  project_name: string
  total: number
  done: number
  percent: number
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: 'К выполнению',
  in_progress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  to_do: '#94a3b8',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#22c55e',
}
