import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, LayoutList, TreePine } from 'lucide-react'
import { getStandards } from '@/lib/actions/standards'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'standards' })
  return { title: t('title') }
}

export default async function StandardsPage({
  params, searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; departmentId?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const page = parseInt(sp.page || '1')
  const result = await getStandards({
    search: sp.search,
    departmentId: sp.departmentId,
    page,
    pageSize: 15,
  })

  return (
    <div>
      <Breadcrumb items={[{ label: t('nav.dashboard'), href: `/${locale}/dashboard` }, { label: t('nav.standards') }]} />
      <PageHeader
        title={t('standards.title')}
        subtitle={t('standards.subtitle')}
        actions={
          <Button asChild>
            <Link href={`/${locale}/standards/new`}>
              <Plus className="w-4 h-4" />
              {t('standards.addStandard')}
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.code')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.standardTitle')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.chapter')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.requirements')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.progress')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('standards.owner')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      {t('standards.noStandards')}
                    </td>
                  </tr>
                ) : result.data.map(std => {
                  const total = std._count?.requirements || 0
                  const completed = std.requirements?.filter((r: { status: string }) => r.status === 'COMPLETED').length || 0
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                  return (
                    <tr key={std.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-semibold">{std.code}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <Link href={`/${locale}/standards/${std.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                            {locale === 'ar' ? std.titleAr : std.title}
                          </Link>
                          {std.parentId && (
                            <span className="text-[10px] text-muted-foreground">Level {std.level}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{std.chapterCode}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{total}</td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <ProgressBar value={pct} showLabel size="sm" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{std.owner?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/standards/${std.id}`}>{t('common.view')}</Link>
                        </Button>
                      </td>
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
