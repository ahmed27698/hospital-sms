import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getUsers, getRoles, getDepartments } from '@/lib/actions/users'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserPlus } from 'lucide-react'
import { formatDateRelative } from '@/lib/utils'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'users' })
  return { title: t('title') }
}

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const result = await getUsers({
    search: sp.search,
    status: sp.status,
    page: parseInt(sp.page || '1'),
    pageSize: 20,
  })

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    QUALITY_MANAGER: 'bg-blue-100 text-blue-700',
    DEPARTMENT_MANAGER: 'bg-green-100 text-green-700',
    SECTION_HEAD: 'bg-amber-100 text-amber-700',
    RESPONSIBLE_USER: 'bg-purple-100 text-purple-700',
    INTERNAL_AUDITOR: 'bg-orange-100 text-orange-700',
    READ_ONLY: 'bg-gray-100 text-gray-700',
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.users') }
      ]} />
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <Button asChild>
            <Link href={`/${locale}/users/new`}>
              <UserPlus className="w-4 h-4" />
              {t('users.addUser')}
            </Link>
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', value: result.total },
          { label: locale === 'ar' ? 'نشطون' : 'Active', value: result.data.filter(u => u.status === 'ACTIVE').length },
          { label: locale === 'ar' ? 'غير نشطين' : 'Inactive', value: result.data.filter(u => u.status === 'INACTIVE').length },
          { label: locale === 'ar' ? 'موقوفون' : 'Suspended', value: result.data.filter(u => u.status === 'SUSPENDED').length },
        ].map(stat => (
          <Card key={stat.label} className="p-4 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('users.name')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('users.role')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('users.department')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('users.status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('users.lastLogin')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">{t('users.noUsers')}</td></tr>
                ) : result.data.map(user => {
                  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image || ''} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.jobTitle && <p className="text-xs text-muted-foreground">{user.jobTitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role.type] || 'bg-gray-100 text-gray-700'}`}>
                          {user.role.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {user.department ? (locale === 'ar' ? user.department.nameAr : user.department.name) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {user.lastLoginAt ? formatDateRelative(user.lastLoginAt, locale) : locale === 'ar' ? 'لم يسجل دخولاً' : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                          <Link href={`/${locale}/users/${user.id}/edit`}>{t('common.edit')}</Link>
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
