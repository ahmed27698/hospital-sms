import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserNotifications, type NotificationRow } from '@/lib/actions/notifications'
import { PageHeader } from '@/components/shared/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, AlertCircle, Clock, FileCheck, UserCheck, Settings, CheckCheck } from 'lucide-react'
import { formatDateRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'notifications' })
  return { title: t('title') }
}

const typeIcons: Record<string, React.ElementType> = {
  OVERDUE_ALERT: AlertCircle,
  DUE_DATE_REMINDER: Clock,
  DOCUMENT_UPDATE: FileCheck,
  APPROVAL_REQUEST: CheckCheck,
  ASSIGNMENT_CHANGE: UserCheck,
  SYSTEM_ALERT: Settings,
}

const typeColors: Record<string, string> = {
  OVERDUE_ALERT: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  DUE_DATE_REMINDER: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  DOCUMENT_UPDATE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  APPROVAL_REQUEST: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  ASSIGNMENT_CHANGE: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  SYSTEM_ALERT: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
}

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const t = await getTranslations({ locale })
  const notifications = await getUserNotifications(session.user.id)
  const unread = notifications.filter((n: NotificationRow) => !n.isRead)

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.notifications') }
      ]} />
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        actions={
          unread.length > 0 ? (
            <form action={async () => {
              'use server'
              const { markAllNotificationsRead } = await import('@/lib/actions/notifications')
              if (session?.user?.id) await markAllNotificationsRead(session.user.id)
            }}>
              <button type="submit" className="text-xs text-primary hover:underline">
                {t('notifications.markAllRead')}
              </button>
            </form>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold">{notifications.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('notifications.all')}</p>
        </Card>
        <Card className="text-center p-4 border-blue-200 dark:border-blue-900">
          <p className="text-2xl font-bold text-blue-600">{unread.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('notifications.unread')}</p>
        </Card>
        <Card className="text-center p-4 border-red-200 dark:border-red-900">
          <p className="text-2xl font-bold text-red-600">
            {notifications.filter((n: NotificationRow) => n.type === 'OVERDUE_ALERT').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t('notifications.overdue')}</p>
        </Card>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">{t('notifications.noNotifications')}</p>
            </div>
          ) : notifications.map(notif => {
            const Icon = typeIcons[notif.type] || Bell
            const colorClass = typeColors[notif.type] || typeColors.SYSTEM_ALERT
            return (
              <div key={notif.id} className={cn(
                'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30',
                !notif.isRead && 'bg-primary/5'
              )}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn('text-sm font-medium', !notif.isRead && 'text-foreground')}>
                        {locale === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {locale === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {formatDateRelative(notif.createdAt, locale)}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
