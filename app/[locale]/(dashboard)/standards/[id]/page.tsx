import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStandardById } from '@/lib/actions/standards'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ChevronRight, User, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params
  const std = await getStandardById(id)
  return { title: std?.title || 'Standard' }
}

export default async function StandardDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const t = await getTranslations({ locale })
  const std = await getStandardById(id)
  if (!std) notFound()

  const total = std._count?.requirements || 0
  const completed = std.requirements?.filter((r: { status: string }) => r.status === 'COMPLETED').length || 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.standards'), href: `/${locale}/standards` },
        { label: std.code }
      ]} />

      <PageHeader
        title={`${std.code} — ${locale === 'ar' ? std.titleAr : std.title}`}
        subtitle={locale === 'ar' ? std.chapterTitleAr : std.chapterTitle}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/${locale}/standards/${id}/edit`}>
              <Edit className="w-4 h-4" />
              {t('standards.editStandard')}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {std.description && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('standards.description')}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {locale === 'ar' ? std.descriptionAr || std.description : std.description}
              </CardContent>
            </Card>
          )}

          {/* Sub-standards */}
          {std.children && std.children.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('standards.children')}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {std.children.map((child: { id: string; code: string; title: string; titleAr: string; _count?: { requirements: number } }) => (
                  <Link key={child.id} href={`/${locale}/standards/${child.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{child.code}</code>
                    <span className="text-sm flex-1 group-hover:text-primary transition-colors">
                      {locale === 'ar' ? child.titleAr : child.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{child._count?.requirements || 0} req</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {std.requirements && std.requirements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('standards.requirements')} ({total})</CardTitle>
                <ProgressBar value={pct} showLabel />
              </CardHeader>
              <CardContent className="space-y-2">
                {std.requirements.map((req: { id: string; code: string; title: string; titleAr: string | null; status: string; owner?: { name: string } | null }) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono shrink-0">{req.code}</code>
                    <span className="text-sm flex-1 min-w-0 truncate">{locale === 'ar' ? req.titleAr : req.title}</span>
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-muted-foreground shrink-0">{req.owner?.name || '—'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground mb-1">Chapter</p><Badge variant="outline">{std.chapterCode}</Badge></div>
              <div><p className="text-xs text-muted-foreground mb-1">Level</p><span>Level {std.level}</span></div>
              {std.owner && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('standards.owner')}</p>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span>{std.owner.name}</span></div>
                </div>
              )}
              {std.backupOwner && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('standards.backupOwner')}</p>
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span>{std.backupOwner.name}</span></div>
                </div>
              )}
              {std.department && (
                <div><p className="text-xs text-muted-foreground mb-1">{t('requirements.department')}</p><span>{locale === 'ar' ? std.department.nameAr : std.department.name}</span></div>
              )}
              {std.effectiveDate && (
                <div><p className="text-xs text-muted-foreground mb-1">{t('standards.effectiveDate')}</p>
                  <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><span>{formatDate(std.effectiveDate, locale)}</span></div>
                </div>
              )}
              {std.reviewDate && (
                <div><p className="text-xs text-muted-foreground mb-1">{t('standards.reviewDate')}</p>
                  <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /><span>{formatDate(std.reviewDate, locale)}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">Completion</p>
                <ProgressBar value={pct} className="mt-3" />
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="font-bold text-green-600">{completed}</p>
                    <p className="text-[10px] text-muted-foreground">Done</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="font-bold">{total - completed}</p>
                    <p className="text-[10px] text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
