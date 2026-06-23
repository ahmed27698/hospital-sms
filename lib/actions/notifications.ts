'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
type NotificationType = 'OVERDUE_ALERT' | 'DUE_DATE_REMINDER' | 'DOCUMENT_UPDATE' | 'APPROVAL_REQUEST' | 'ASSIGNMENT_CHANGE' | 'SYSTEM_ALERT'

interface NotificationInput {
  userId: string
  type: NotificationType
  title: string
  titleAr?: string
  message: string
  messageAr?: string
  link?: string
  metadata?: Record<string, unknown>
}

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { ...input, metadata: input.metadata as any },
  })
}

export type NotificationRow = {
  id: string; userId: string; type: string; title: string; titleAr: string | null
  message: string; messageAr: string | null; isRead: boolean; readAt: Date | null
  link: string | null; metadata: unknown; createdAt: Date
}

export async function getUserNotifications(userId: string, unreadOnly = false): Promise<NotificationRow[]> {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  await prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } })
  revalidatePath('/[locale]/(dashboard)/notifications', 'page')
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/[locale]/(dashboard)/notifications', 'page')
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } })
}
