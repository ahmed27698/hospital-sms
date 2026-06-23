import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm'

export const metadata: Metadata = { title: 'Upload Document' }

export default async function DocumentUploadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const [departments, standards, requirements] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.standard.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true },
      orderBy: { code: 'asc' },
    }),
    prisma.requirement.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true },
      orderBy: { code: 'asc' },
    }),
  ])

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.documents'), href: `/${locale}/documents` },
        { label: locale === 'ar' ? 'رفع وثيقة' : 'Upload Document' },
      ]} />
      <PageHeader
        title={locale === 'ar' ? 'رفع وثيقة جديدة' : 'Upload New Document'}
        subtitle={locale === 'ar' ? 'ارفع سياسة أو إجراء أو نموذج أو أي وثيقة داعمة' : 'Upload a policy, procedure, form, or supporting document'}
      />
      <DocumentUploadForm
        locale={locale}
        departments={departments}
        standards={standards}
        requirements={requirements}
      />
    </div>
  )
}
