import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { RequirementForm } from '@/components/requirements/RequirementForm'

export const metadata: Metadata = { title: 'Add Requirement' }

export default async function NewRequirementPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ standardId?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const [standards, departments, users] = await Promise.all([
    prisma.standard.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true },
      orderBy: { code: 'asc' },
    }),
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.requirements'), href: `/${locale}/requirements` },
        { label: locale === 'ar' ? 'إضافة متطلب' : 'Add Requirement' },
      ]} />
      <PageHeader
        title={locale === 'ar' ? 'إضافة متطلب جديد' : 'Add New Requirement'}
        subtitle={locale === 'ar' ? 'أنشئ متطلباً جديداً لمعيار الاعتماد' : 'Create a new accreditation requirement'}
      />
      <RequirementForm
        locale={locale}
        standards={standards}
        departments={departments}
        users={users}
        defaultStandardId={sp.standardId}
      />
    </div>
  )
}
