import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { BookOpen, CheckSquare, AlertCircle, TrendingUp, Clock, Activity } from 'lucide-react'
import { getDashboardStats, getDepartmentProgress, getChapterProgress, getRecentActivity, getUpcomingDeadlines, getOverdueRequirements } from '@/lib/actions/dashboard'
import { KPICard } from '@/components/dashboard/KPICard'
import { ComplianceDonut, ComplianceTrend, DepartmentBar } from '@/components/dashboard/ComplianceChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate, formatDateRelative } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  return { title: t('title') }
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const [stats, deptProgress, chapterProgress, recentActivity, upcomingDeadlines, overdueItems] = await Promise.all([
    getDashboardStats(),
    getDepartmentProgress(),
    getChapterProgress(),
    getRecentActivity(6),
    getUpcomingDeadlines(5),
    getOverdueRequirements(5),
  ])

  const donutData = [
    { name: t('dashboard.completedRequirements'), value: stats.completedRequirements, color: '#22c55e' },
    { name: t('dashboard.inProgress'), value: stats.inProgressRequirements, color: '#3b82f6' },
    { name: t('dashboard.notStarted'), value: stats.notStartedRequirements, color: '#94a3b8' },
    { name: t('dashboard.overdueRequirements'), value: stats.overdueRequirements, color: '#ef4444' },
  ]

  const trendData = [
    { month: 'Jul', value: 42 }, { month: 'Aug', value: 51 }, { month: 'Sep', value: 58 },
    { month: 'Oct', value: 63 }, { month: 'Nov', value: 69 }, { month: 'Dec', value: stats.completionPercentage },
  ]

  const actionAuditLabels: Record<string, string> = {
    CREATE: '🟢', UPDATE: '🔵', DELETE: '🔴', VIEW: '⚪', LOGIN: '🟡',
    LOGOUT: '🟡', UPLOAD: '🟣', DOWNLOAD: '⚪', APPROVE: '🟢', REJECT: '🔴',
  }

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title={t('dashboard.totalStandards')} value={stats.totalStandards} icon={BookOpen} color="blue" subtitle={locale === 'ar' ? 'معيار نشط' : 'Active standards'} />
        <KPICard title={t('dashboard.totalRequirements')} value={stats.totalRequirements} icon={CheckSquare} color="purple" subtitle={locale === 'ar' ? 'إجمالي المتطلبات' : 'Total requirements'} />
        <KPICard title={t('dashboard.completedRequirements')} value={stats.completedRequirements} icon={TrendingUp} color="green" subtitle={`${stats.completionPercentage}% ${locale === 'ar' ? 'من الإجمالي' : 'of total'}`} />
        <KPICard title={t('dashboard.overdueRequirements')} value={stats.overdueRequirements} icon={AlertCircle} color="red" subtitle={locale === 'ar' ? 'تحتاج اهتماماً فورياً' : 'Need immediate attention'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.overallCompliance')}</CardTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.completionPercentage}%</span>
              <span className="text-xs text-muted-foreground">{t('dashboard.target')}: 90%</span>
            </div>
            <ProgressBar value={stats.completionPercentage} showLabel={false} className="mt-1" />
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<div className="h-[220px] flex items-center justify-center"><div className="text-sm text-muted-foreground">Loading chart…</div></div>}>
              <ComplianceDonut data={donutData} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.complianceTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[200px]" />}>
              <ComplianceTrend data={trendData} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Department + Chapter + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Department progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.departmentProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            {deptProgress.length > 0 ? (
              <div className="space-y-3">
                {deptProgress.slice(0, 6).map((dept: import('@/types').DepartmentProgress) => (
                  <div key={dept.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">
                      {locale === 'ar' ? dept.nameAr : dept.name}
                    </span>
                    <ProgressBar value={dept.percentage} className="flex-1" size="sm" showLabel />
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                      {dept.completed}/{dept.total}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <DepartmentBar data={[
                { name: 'Emergency', percentage: 88 },
                { name: 'ICU', percentage: 76 },
                { name: 'Pharmacy', percentage: 59 },
                { name: 'Infect. Control', percentage: 41 },
                { name: 'Med. Records', percentage: 64 },
              ]} />
            )}
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {t('dashboard.overdueItems')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">✅ {locale === 'ar' ? 'لا توجد عناصر متأخرة' : 'No overdue items'}</p>
            ) : (overdueItems as { id: string; title: string; dueDate: Date | null; status: string; standard: { code: string }; department?: { name: string } | null }[]).map((req) => (
              <div key={req.id} className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                <p className="text-xs font-medium text-foreground">{req.standard.code} — {req.title}</p>
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                  {req.department?.name} • {req.dueDate ? formatDate(req.dueDate, locale) : '—'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              {t('dashboard.upcomingDeadlines')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{locale === 'ar' ? 'لا توجد مواعيد قريبة' : 'No upcoming deadlines'}</p>
            ) : (upcomingDeadlines as { id: string; title: string; dueDate: Date | null; status: string; standard: { code: string }; department?: { name: string; nameAr: string } | null; owner?: { name: string } | null }[]).map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{req.standard.code} — {req.title}</p>
                  <p className="text-[11px] text-muted-foreground">{req.department?.name} • {req.owner?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={req.status} />
                  <p className="text-[10px] text-amber-600 mt-1">{formatDate(req.dueDate, locale)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{locale === 'ar' ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
              ) : recentActivity.map((log: { id: string; description: string; action: string; createdAt: Date; user?: { name: string; image?: string | null } | null }) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">{actionAuditLabels[log.action] || '⚪'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{log.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {log.user?.name || 'System'} • {formatDateRelative(log.createdAt, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
