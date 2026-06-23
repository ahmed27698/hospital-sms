'use server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { DashboardStats, DepartmentProgress, ChapterProgress } from '@/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalStandards,
    totalRequirements,
    completedRequirements,
    overdueRequirements,
    inProgressRequirements,
    notStartedRequirements,
  ] = await Promise.all([
    prisma.standard.count({ where: { isActive: true } }),
    prisma.requirement.count({ where: { isActive: true } }),
    prisma.requirement.count({ where: { isActive: true, status: 'COMPLETED' } }),
    prisma.requirement.count({ where: { isActive: true, status: 'OVERDUE' } }),
    prisma.requirement.count({ where: { isActive: true, status: 'IN_PROGRESS' } }),
    prisma.requirement.count({ where: { isActive: true, status: 'NOT_STARTED' } }),
  ])

  const completionPercentage = totalRequirements > 0
    ? Math.round((completedRequirements / totalRequirements) * 100)
    : 0

  return {
    totalStandards,
    totalRequirements,
    completedRequirements,
    overdueRequirements,
    inProgressRequirements,
    notStartedRequirements,
    completionPercentage,
  }
}

export async function getDepartmentProgress(): Promise<DepartmentProgress[]> {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      requirements: {
        where: { isActive: true },
        select: { status: true },
      },
    },
  })

  return departments.map((dept: {
    id: string; name: string; nameAr: string;
    requirements: { status: string }[]
  }) => {
    const total = dept.requirements.length
    const completed = dept.requirements.filter((r: { status: string }) => r.status === 'COMPLETED').length
    return {
      id: dept.id,
      name: dept.name,
      nameAr: dept.nameAr,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }).sort((a: { percentage: number }, b: { percentage: number }) => b.percentage - a.percentage)
}

export async function getChapterProgress(): Promise<ChapterProgress[]> {
  const standards = await prisma.standard.findMany({
    where: { isActive: true },
    include: {
      requirements: {
        where: { isActive: true },
        select: { status: true },
      },
    },
  })

  const chapters = new Map<string, { chapterAr: string; total: number; completed: number }>()

  for (const std of standards as { chapterCode: string; chapterTitleAr: string; requirements: { status: string }[] }[]) {
    const existing = chapters.get(std.chapterCode) || { chapterAr: std.chapterTitleAr, total: 0, completed: 0 }
    existing.total += std.requirements.length
    existing.completed += std.requirements.filter((r: { status: string }) => r.status === 'COMPLETED').length
    chapters.set(std.chapterCode, existing)
  }

  return Array.from(chapters.entries()).map(([code, data]) => ({
    chapter: code,
    chapterAr: data.chapterAr,
    total: data.total,
    completed: data.completed,
    percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }))
}

export async function getRecentActivity(limit = 10) {
  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, image: true } } },
  })
}

export async function getUpcomingDeadlines(limit = 5) {
  const now = new Date()
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  return prisma.requirement.findMany({
    where: {
      isActive: true,
      dueDate: { gte: now, lte: future },
      status: { not: 'COMPLETED' },
    },
    take: limit,
    orderBy: { dueDate: 'asc' },
    include: {
      standard: { select: { code: true, title: true } },
      department: { select: { name: true, nameAr: true } },
      owner: { select: { name: true } },
    },
  })
}

export async function getOverdueRequirements(limit = 5) {
  return prisma.requirement.findMany({
    where: {
      isActive: true,
      OR: [
        { status: 'OVERDUE' },
        { dueDate: { lt: new Date() }, status: { notIn: ['COMPLETED', 'WAIVED'] } },
      ],
    },
    take: limit,
    orderBy: { dueDate: 'asc' },
    include: {
      standard: { select: { code: true, title: true } },
      department: { select: { name: true } },
      owner: { select: { name: true } },
    },
  })
}
