'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'
import { createAuditLog } from './audit'
import type { PaginatedResult, UserWithRole, TableFilters } from '@/types'

export async function registerUser(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email already in use')

  if (data.password !== data.confirmPassword) throw new Error('Passwords do not match')
  if (data.password.length < 8) throw new Error('Password must be at least 8 characters')
  if (!/[A-Z]/.test(data.password)) throw new Error('Password must contain an uppercase letter')
  if (!/[0-9]/.test(data.password)) throw new Error('Password must contain a number')

  // Auto-assign the Staff role (or first available role)
  const staffRole = await prisma.role.findFirst({
    where: { type: { in: ['STAFF', 'staff'] } },
  }) ?? await prisma.role.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!staffRole) throw new Error('No roles configured. Ask an admin to set up the system first.')

  const hashed = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      roleId: staffRole.id,
      status: 'ACTIVE',
    },
  })

  return { success: true, userId: user.id }
}

export async function getUsers(filters: TableFilters = {}): Promise<PaginatedResult<UserWithRole>> {
  const { search, status, departmentId, page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (departmentId) where.departmentId = departmentId

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { name: 'asc' },
      include: {
        role: true,
        department: { select: { id: true, name: true, nameAr: true } },
        section: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: data as UserWithRole[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  confirmPassword: string
  roleId: string
  departmentId?: string
  sectionId?: string
  jobTitle?: string
  phone?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Validation failed')

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email already in use')

  const hashed = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      roleId: data.roleId,
      departmentId: data.departmentId || null,
      sectionId: data.sectionId || null,
      jobTitle: data.jobTitle || null,
      phone: data.phone || null,
      status: 'ACTIVE',
    },
    include: { role: true },
  })

  await createAuditLog({
    action: 'CREATE',
    resource: 'user',
    resourceId: user.id,
    description: `Created user: ${user.email}`,
  })

  revalidatePath('/[locale]/(dashboard)/users', 'page')
  return user
}

export async function updateUser(id: string, data: Partial<{
  name: string
  email: string
  roleId: string
  departmentId: string
  sectionId: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  jobTitle: string
  phone: string
}>) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const user = await prisma.user.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
    include: { role: true },
  })

  await createAuditLog({
    action: 'UPDATE',
    resource: 'user',
    resourceId: id,
    description: `Updated user: ${user.email}`,
  })

  revalidatePath('/[locale]/(dashboard)/users', 'page')
  return user
}

export async function updateUserPassword(id: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { password: hashed } })
  return { success: true }
}

export async function deleteUser(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  if (session.user.id === id) throw new Error('Cannot delete yourself')

  await prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })
  await createAuditLog({ action: 'DELETE', resource: 'user', resourceId: id, description: 'Deactivated user' })
  revalidatePath('/[locale]/(dashboard)/users', 'page')
  return { success: true }
}

export async function getRoles() {
  return prisma.role.findMany({ orderBy: { type: 'asc' } })
}

export async function getDepartments() {
  return prisma.department.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
}

export async function getSections(departmentId?: string) {
  return prisma.section.findMany({
    where: { isActive: true, ...(departmentId ? { departmentId } : {}) },
    orderBy: { name: 'asc' },
  })
}
