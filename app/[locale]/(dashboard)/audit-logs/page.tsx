import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAuditLogs } from '@/lib/actions/audit'
import { PageHeader } from '@/components/shared/PageHeader'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

type AuditLogRow = {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  description: string
  createdAt: Date
  user: { name: string; image: string | null } | null
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'audit' })
  return { title: t('title') }
}

export default async function AuditLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const result = await getAuditLogs({ page: parseInt(sp.page || '1'), pageSize: 30 })

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30',
    UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30',
    VIEW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30',
    LOGIN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    LOGOUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    UPLOAD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30',
    DOWNLOAD: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30',
    APPROVE: 'bg-green-100 text-green-700 dark:bg-green-900/30',
    REJECT: 'bg-red-100 text-red-700 dark:bg-red-900/30',
  }

  const actionLabels: Record<string, string> = {
    CREATE: t('audit.actionCreate'), UPDATE: t('audit.actionUpdate'),
    DELETE: t('audit.actionDelete'), VIEW: t('audit.actionView'),
    LOGIN: t('audit.actionLogin'), LOGOUT: t('audit.actionLogout'),
    UPLOAD: t('audit.actionUpload'), DOWNLOAD: t('audit.actionDownload'),
    APPROVE: t('audit.actionApprove'), REJECT: t('audit.actionReject'),
  }

  const rows = result.data as AuditLogRow[]

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.auditLogs') }
      ]} />
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('audit.user')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('audit.action')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('audit.resource')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('audit.details')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('audit.timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No audit logs yet</td></tr>
                ) : rows.map((log: AuditLogRow) => {
                  const initials = log.user?.name
                    ? log.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'SY'
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{log.user?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', actionColors[log.action] || 'bg-gray-100 text-gray-700')}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs capitalize">{log.resource}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.description}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateRelative(log.createdAt, locale)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
