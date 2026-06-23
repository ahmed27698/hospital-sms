import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { StandardForm } from '@/components/standards/StandardForm'

export const metadata: Metadata = { title: 'Add Standard' }

export default async function NewStandardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const [departments, users, parentStandards] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.standard.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true },
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.standards'), href: `/${locale}/standards` },
        { label: locale === 'ar' ? 'إضافة معيار' : 'Add Standard' },
      ]} />
      <PageHeader
        title={locale === 'ar' ? 'إضافة معيار جديد' : 'Add New Standard'}
        subtitle={locale === 'ar' ? 'أنشئ معياراً جديداً في التسلسل الهرمي' : 'Create a new standard in the hierarchy'}
      />
      <StandardForm
        locale={locale}
        departments={departments}
        users={users}
        parentStandards={parentStandards}
      />
    </div>
  )
}
