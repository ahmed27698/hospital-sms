'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { standardSchema, type StandardInput } from '@/lib/validations/standard'
import { createAuditLog } from './audit'
import type { PaginatedResult, StandardWithRelations, TableFilters } from '@/types'

export async function getStandards(filters: TableFilters = {}): Promise<PaginatedResult<StandardWithRelations>> {
  const { search, status, departmentId, page = 1, pageSize = 20, sortBy = 'code', sortDir = 'asc' } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = { isActive: true }
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { titleAr: { contains: search, mode: 'insensitive' } },
      { chapterCode: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (departmentId) where.departmentId = departmentId

  const [data, total] = await Promise.all([
    prisma.standard.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
      include: {
        owner: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, nameAr: true } },
        section: { select: { id: true, name: true } },
        _count: { select: { requirements: true, children: true } },
      },
    }),
    prisma.standard.count({ where }),
  ])

  return {
    data: data as StandardWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getStandardById(id: string): Promise<StandardWithRelations | null> {
  return prisma.standard.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      backupOwner: { select: { id: true, name: true, email: true } },
      department: true,
      section: true,
      parent: { select: { id: true, code: true, title: true } },
      children: {
        include: {
          _count: { select: { requirements: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
      requirements: {
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
        include: { owner: { select: { name: true } } },
      },
      _count: { select: { requirements: true, children: true } },
    },
  }) as Promise<StandardWithRelations | null>
}

export async function createStandard(data: StandardInput) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const parsed = standardSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)

  const existing = await prisma.standard.findUnique({ where: { code: parsed.data.code } })
  if (existing) throw new Error('Standard code already exists')

  const standard = await prisma.standard.create({
    data: {
      ...parsed.data,
      effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : null,
      reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
    },
  })

  await createAuditLog({ action: 'CREATE', resource: 'standard', resourceId: standard.id, description: `Created standard ${standard.code}` })
  revalidatePath('/[locale]/(dashboard)/standards', 'page')
  return standard
}

export async function updateStandard(id: string, data: Partial<StandardInput>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const old = await prisma.standard.findUnique({ where: { id } })
  const standard = await prisma.standard.update({
    where: { id },
    data: {
      ...data,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      updatedAt: new Date(),
    },
  })

  await createAuditLog({ action: 'UPDATE', resource: 'standard', resourceId: id, description: `Updated standard ${standard.code}`, oldValues: old, newValues: standard })
  revalidatePath('/[locale]/(dashboard)/standards', 'page')
  return standard
}

export async function deleteStandard(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const standard = await prisma.standard.update({ where: { id }, data: { isActive: false } })
  await createAuditLog({ action: 'DELETE', resource: 'standard', resourceId: id, description: `Deleted standard ${standard.code}` })
  revalidatePath('/[locale]/(dashboard)/standards', 'page')
  return { success: true }
}

export async function getStandardsHierarchy() {
  const standards = await prisma.standard.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ chapterCode: 'asc' }, { orderIndex: 'asc' }],
    include: {
      children: {
        include: {
          children: {
            include: { _count: { select: { requirements: true } } },
            orderBy: { orderIndex: 'asc' },
          },
          _count: { select: { requirements: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
      _count: { select: { requirements: true } },
    },
  })
  return standards
}
