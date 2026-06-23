import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users2, Building2, Layers } from 'lucide-react'

type DeptWithStats = {
  id: string; name: string; nameAr: string
  sections: { id: string }[]
  requirements: { status: string }[]
}
type UserWithStats = {
  id: string; name: string; role: { name: string; type: string }
  department: { name: string; nameAr: string } | null
  _count: { ownedStandards: number; ownedRequirements: number }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { title: 'Responsibilities' }
}

export default async function ResponsibilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const [departments, users] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      include: {
        sections: { where: { isActive: true } },
        requirements: { where: { isActive: true }, select: { status: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        role: { select: { name: true, type: true } },
        department: { select: { name: true, nameAr: true } },
        _count: { select: { ownedStandards: true, ownedRequirements: true } },
      },
      orderBy: { name: 'asc' },
      take: 20,
    }),
  ])

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.responsibilities') }
      ]} />
      <PageHeader
        title={locale === 'ar' ? 'إدارة المسؤوليات' : 'Responsibilities Management'}
        subtitle={locale === 'ar' ? 'إدارة الأقسام والوحدات وأصحاب المعايير' : 'Manage departments, sections and standard owners'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {locale === 'ar' ? 'الأقسام' : 'Departments'} ({departments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(departments as DeptWithStats[]).map(dept => {
              const total = dept.requirements.length
              const completed = dept.requirements.filter((r: { status: string }) => r.status === 'COMPLETED').length
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={dept.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{locale === 'ar' ? dept.nameAr : dept.name}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">{dept.name.slice(0, 4).toUpperCase()}</Badge>
                        {dept.sections.length} {locale === 'ar' ? 'وحدة' : 'sections'}
                      </span>
                    </div>
                    <span className="text-sm font-bold">{pct}%</span>
                  </div>
                  <ProgressBar value={pct} size="sm" />
                  <p className="text-[11px] text-muted-foreground mt-1">{completed}/{total} {locale === 'ar' ? 'مكتمل' : 'completed'}</p>
                </div>
              )
            })}
            {departments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                {locale === 'ar' ? 'لا توجد أقسام' : 'No departments found'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Users / Owners */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              {locale === 'ar' ? 'أصحاب المعايير' : 'Standard Owners'} ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(users as UserWithStats[]).map(user => {
              const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.department ? (locale === 'ar' ? user.department.nameAr : user.department.name) : user.role.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{user._count.ownedStandards} std</p>
                    <p className="text-[11px] text-muted-foreground">{user._count.ownedRequirements} req</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
