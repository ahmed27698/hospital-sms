import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getRequirements } from '@/lib/actions/requirements'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getPriorityLabel } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'requirements' })
  return { title: t('title') }
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  WAIVED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export default async function RequirementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; status?: string; departmentId?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const page = parseInt(sp.page || '1')
  const result = await getRequirements({
    search: sp.search,
    status: sp.status,
    departmentId: sp.departmentId,
    page,
    pageSize: 20,
  })

  const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'OVERDUE', 'WAIVED']
  const statusLabels: Record<string, string> = {
    NOT_STARTED: t('requirements.statusNotStarted'),
    IN_PROGRESS: t('requirements.statusInProgress'),
    UNDER_REVIEW: t('requirements.statusUnderReview'),
    COMPLETED: t('requirements.statusCompleted'),
    OVERDUE: t('requirements.statusOverdue'),
    WAIVED: t('requirements.statusWaived'),
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.requirements') }
      ]} />
      <PageHeader
        title={t('requirements.title')}
        subtitle={t('requirements.subtitle')}
        actions={
          <Button asChild>
            <Link href={`/${locale}/requirements/new`}>
              <Plus className="w-4 h-4" />
              {t('requirements.addRequirement')}
            </Link>
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Link href={`/${locale}/requirements`}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${!sp.status ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
          {t('common.all')} ({result.total})
        </Link>
        {statuses.map(s => (
          <Link key={s} href={`/${locale}/requirements?status=${s}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${sp.status === s ? 'bg-primary text-primary-foreground border-primary' : `border-border hover:bg-muted`}`}>
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.code')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.requirementTitle')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.standard')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.priority')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.dueDate')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('requirements.owner')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">{t('requirements.noRequirements')}</td></tr>
                ) : result.data.map(req => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{req.code}</code>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="font-medium line-clamp-2 text-xs leading-relaxed">{locale === 'ar' ? req.titleAr : req.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{req.standard.code}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} label={statusLabels[req.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.priority === 3 ? 'bg-red-100 text-red-700' : req.priority === 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {getPriorityLabel(req.priority, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {req.dueDate ? (
                        <span className={new Date(req.dueDate) < new Date() && req.status !== 'COMPLETED' ? 'text-red-500 font-medium' : ''}>
                          {formatDate(req.dueDate, locale)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{req.owner?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
