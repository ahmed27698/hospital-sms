'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requirementSchema, type RequirementInput } from '@/lib/validations/requirement'
import { createAuditLog } from './audit'
import { createNotification } from './notifications'
import type { PaginatedResult, RequirementWithRelations, TableFilters } from '@/types'

export async function getRequirements(filters: TableFilters = {}): Promise<PaginatedResult<RequirementWithRelations>> {
  const { search, status, departmentId, page = 1, pageSize = 20, sortBy = 'code', sortDir = 'asc' } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = { isActive: true }
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { titleAr: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (departmentId) where.departmentId = departmentId

  const [data, total] = await Promise.all([
    prisma.requirement.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
      include: {
        standard: { select: { id: true, code: true, title: true, chapterCode: true } },
        owner: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, nameAr: true } },
        section: { select: { id: true, name: true } },
      },
    }),
    prisma.requirement.count({ where }),
  ])

  return {
    data: data as RequirementWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function createRequirement(data: RequirementInput) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const parsed = requirementSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)

  const req = await prisma.requirement.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  })

  await createAuditLog({ action: 'CREATE', resource: 'requirement', resourceId: req.id, description: `Created requirement ${req.code}` })
  revalidatePath('/[locale]/(dashboard)/requirements', 'page')
  return req
}

export async function updateRequirement(id: string, data: Partial<RequirementInput>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const old = await prisma.requirement.findUnique({ where: { id } })
  const req = await prisma.requirement.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      updatedAt: new Date(),
    },
  })

  if (data.status === 'COMPLETED' && old?.status !== 'COMPLETED' && req.ownerId) {
    await createNotification({
      userId: req.ownerId,
      type: 'DOCUMENT_UPDATE',
      title: 'Requirement Completed',
      titleAr: 'تم إكمال المتطلب',
      message: `Requirement ${req.code} has been marked as completed.`,
      messageAr: `تم تحديد المتطلب ${req.code} كمكتمل.`,
      link: `/requirements/${id}`,
    })
  }

  await createAuditLog({ action: 'UPDATE', resource: 'requirement', resourceId: id, description: `Updated requirement ${req.code} status to ${req.status}`, oldValues: old, newValues: req })
  revalidatePath('/[locale]/(dashboard)/requirements', 'page')
  return req
}

export async function deleteRequirement(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const req = await prisma.requirement.update({ where: { id }, data: { isActive: false } })
  await createAuditLog({ action: 'DELETE', resource: 'requirement', resourceId: id, description: `Deleted requirement ${req.code}` })
  revalidatePath('/[locale]/(dashboard)/requirements', 'page')
  return { success: true }
}

export async function updateOverdueRequirements() {
  const now = new Date()
  const result = await prisma.requirement.updateMany({
    where: {
      isActive: true,
      dueDate: { lt: now },
      status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
    },
    data: { status: 'OVERDUE' },
  })
  return result
}
