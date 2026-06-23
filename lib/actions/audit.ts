'use server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DOWNLOAD' | 'APPROVE' | 'REJECT'

interface AuditLogInput {
  action: AuditAction
  resource: string
  resourceId?: string
  description: string
  oldValues?: unknown
  newValues?: unknown
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        description: input.description,
        oldValues: input.oldValues ? JSON.parse(JSON.stringify(input.oldValues)) : undefined,
        newValues: input.newValues ? JSON.parse(JSON.stringify(input.newValues)) : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(filters: { page?: number; pageSize?: number; resource?: string; userId?: string } = {}) {
  const { page = 1, pageSize = 20, resource, userId } = filters
  const skip = (page - 1) * pageSize
  const where: Record<string, unknown> = {}
  if (resource) where.resource = resource
  if (userId) where.userId = userId

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, image: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export type AuditLogWithUser = {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  description: string
  oldValues: unknown
  newValues: unknown
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user: { name: string; image: string | null } | null
}
