import type { User, Role, Department, Section, Standard, Requirement, Document, Notification, AuditLog } from '@prisma/client'

export type { User, Role, Department, Section, Standard, Requirement, Document, Notification, AuditLog }

export type UserWithRole = User & { role: Role; department?: Department | null; section?: Section | null }

export type StandardWithRelations = Standard & {
  owner?: User | null
  backupOwner?: User | null
  department?: Department | null
  section?: Section | null
  children?: StandardWithRelations[]
  parent?: Standard | null
  requirements?: Requirement[]
  _count?: { requirements: number }
}

export type RequirementWithRelations = Requirement & {
  standard: Standard
  owner?: User | null
  department?: Department | null
  section?: Section | null
}

export type DocumentWithRelations = Document & {
  uploadedBy: User
}

export type NotificationWithUser = Notification & { user?: User }

export interface DashboardStats {
  totalStandards: number
  totalRequirements: number
  completedRequirements: number
  overdueRequirements: number
  inProgressRequirements: number
  notStartedRequirements: number
  completionPercentage: number
}

export interface DepartmentProgress {
  id: string
  name: string
  nameAr: string
  total: number
  completed: number
  percentage: number
}

export interface ChapterProgress {
  chapter: string
  chapterAr: string
  total: number
  completed: number
  percentage: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type SortDirection = 'asc' | 'desc'

export interface TableFilters {
  search?: string
  status?: string
  departmentId?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: SortDirection
}
