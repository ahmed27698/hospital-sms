import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { UserForm } from '@/components/users/UserForm'
import { getRoles, getDepartments, getSections } from '@/lib/actions/users'

export const metadata: Metadata = { title: 'Add User' }

export default async function AddUserPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const [roles, departments, sections] = await Promise.all([
    getRoles(),
    getDepartments(),
    getSections(),
  ])

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.users'), href: `/${locale}/users` },
        { label: locale === 'ar' ? 'إضافة مستخدم' : 'Add User' },
      ]} />
      <PageHeader
        title={locale === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
        subtitle={locale === 'ar' ? 'أنشئ حساباً جديداً وحدد الدور والقسم' : 'Create a new account and assign a role and department'}
      />
      <UserForm
        locale={locale}
        roles={roles.map(r => ({ id: r.id, name: r.name, nameAr: r.nameAr, type: r.type }))}
        departments={departments}
        sections={sections.map(s => ({ id: s.id, name: s.name, departmentId: s.departmentId }))}
      />
    </div>
  )
}
