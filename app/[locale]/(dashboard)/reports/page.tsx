import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, BarChart3, AlertTriangle, Clock, Building2 } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'reports' })
  return { title: t('title') }
}

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const reports = [
    { key: 'accreditationReadiness', icon: BarChart3, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30', title: t('reports.accreditationReadiness'), desc: locale === 'ar' ? 'تقرير شامل لجاهزية الاعتماد' : 'Full accreditation compliance report' },
    { key: 'missingDocuments', icon: AlertTriangle, color: 'bg-red-50 text-red-600 dark:bg-red-950/30', title: t('reports.missingDocuments'), desc: locale === 'ar' ? 'المتطلبات التي تفتقر إلى وثائق داعمة' : 'Requirements missing supporting documents' },
    { key: 'delayedRequirements', icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30', title: t('reports.delayedRequirements'), desc: locale === 'ar' ? 'المتطلبات المتأخرة وقيد التنفيذ' : 'Overdue and delayed requirements' },
    { key: 'departmentReport', icon: Building2, color: 'bg-green-50 text-green-600 dark:bg-green-950/30', title: t('reports.departmentReport'), desc: locale === 'ar' ? 'تقدم الامتثال حسب القسم' : 'Compliance progress by department' },
  ]

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.reports') }
      ]} />
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map(report => (
          <Card key={report.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.color}`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {t('reports.exportPDF')}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      {t('reports.exportExcel')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
