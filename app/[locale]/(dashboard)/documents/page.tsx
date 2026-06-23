import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getDocuments } from '@/lib/actions/documents'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Download } from 'lucide-react'
import { formatDate, formatBytes } from '@/lib/utils'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'documents' })
  return { title: t('title') }
}

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; search?: string; status?: string; type?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale })

  const result = await getDocuments({
    search: sp.search,
    status: sp.status,
    type: sp.type,
    page: parseInt(sp.page || '1'),
    pageSize: 20,
  })

  const typeColors: Record<string, string> = {
    POLICY: 'bg-blue-100 text-blue-700',
    PROCEDURE: 'bg-green-100 text-green-700',
    FORM: 'bg-amber-100 text-amber-700',
    GUIDELINE: 'bg-purple-100 text-purple-700',
    CIRCULAR: 'bg-orange-100 text-orange-700',
    SUPPORTING: 'bg-gray-100 text-gray-700',
  }

  const typeLabels: Record<string, string> = {
    POLICY: t('documents.typePolicies'),
    PROCEDURE: t('documents.typeProcedures'),
    FORM: t('documents.typeForms'),
    GUIDELINE: t('documents.typeGuidelines'),
    CIRCULAR: t('documents.typeCirculars'),
    SUPPORTING: t('documents.typeSupporting'),
  }

  const docTypes = ['POLICY', 'PROCEDURE', 'FORM', 'GUIDELINE', 'CIRCULAR', 'SUPPORTING']

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.documents') }
      ]} />
      <PageHeader
        title={t('documents.title')}
        subtitle={t('documents.subtitle')}
        actions={
          <Button asChild>
            <Link href={`/${locale}/documents/upload`}>
              <Upload className="w-4 h-4" />
              {t('documents.upload')}
            </Link>
          </Button>
        }
      />

      {/* Type filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Link href={`/${locale}/documents`}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!sp.type ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
          {t('common.all')} ({result.total})
        </Link>
        {docTypes.map(type => (
          <Link key={type} href={`/${locale}/documents?type=${type}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${sp.type === type ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
            {typeLabels[type]}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.documentTitle')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.type')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.version')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.fileSize')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.uploadedBy')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('documents.uploadedAt')}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      {t('documents.noDocuments')}
                    </td>
                  </tr>
                ) : result.data.map(doc => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{locale === 'ar' && doc.titleAr ? doc.titleAr : doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[doc.type] || 'bg-gray-100 text-gray-700'}`}>
                        {typeLabels[doc.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">v{doc.version}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{doc.uploadedBy.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(doc.createdAt, locale)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={doc.filePath} download={doc.fileName}>
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
