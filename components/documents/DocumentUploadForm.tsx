'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, FileText, X } from 'lucide-react'
import { uploadDocument } from '@/lib/actions/documents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBytes } from '@/lib/utils'

const DOC_TYPES = [
  { value: 'POLICY', label: 'Policy' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'FORM', label: 'Form' },
  { value: 'GUIDELINE', label: 'Guideline' },
  { value: 'CIRCULAR', label: 'Circular' },
  { value: 'SUPPORTING', label: 'Supporting Document' },
]

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
]

interface Props {
  locale: string
  departments: { id: string; name: string; nameAr: string }[]
  standards: { id: string; code: string; title: string }[]
  requirements: { id: string; code: string; title: string }[]
}

export function DocumentUploadForm({ locale, departments, standards, requirements }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    title: '', titleAr: '', type: 'POLICY',
    description: '', departmentId: '',
    standardId: '', requirementId: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_MIME.includes(file.type)) {
      setError('File type not allowed. Use PDF, DOCX, DOC, JPG, or PNG.')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.')
      e.target.value = ''
      return
    }
    setError('')
    setSelectedFile(file)
    if (!form.title) setForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) { setError('Please select a file.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('title', form.title)
      fd.append('titleAr', form.titleAr)
      fd.append('type', form.type)
      if (form.description) fd.append('description', form.description)
      if (form.departmentId) fd.append('departmentId', form.departmentId)
      if (form.standardId) fd.append('standardId', form.standardId)
      if (form.requirementId) fd.append('requirementId', form.requirementId)
      await uploadDocument(fd)
      router.push(`/${locale}/documents`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'h-9 text-sm'
  const labelClass = 'text-xs font-medium'
  const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* File drop area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'الملف' : 'File'}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">{locale === 'ar' ? 'انقر لاختيار الملف' : 'Click to select a file'}</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, DOC, JPG, PNG — max 10 MB</p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
            onChange={handleFile}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Document info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'معلومات الوثيقة' : 'Document Info'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (English) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="Document title" value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (Arabic)</Label>
            <Input className={inputClass} dir="rtl" placeholder="عنوان الوثيقة" value={form.titleAr} onChange={set('titleAr')} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Document Type <span className="text-destructive">*</span></Label>
            <select className={selectClass} value={form.type} onChange={set('type')} required>
              {DOC_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Department</Label>
            <select className={selectClass} value={form.departmentId} onChange={set('departmentId')}>
              <option value="">— No department —</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass}>Description</Label>
            <Textarea className="text-sm min-h-[70px]" placeholder="Optional description..." value={form.description} onChange={set('description')} />
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'ربط بمعيار أو متطلب (اختياري)' : 'Link to Standard / Requirement (optional)'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Link to Standard</Label>
            <select className={selectClass} value={form.standardId} onChange={set('standardId')}>
              <option value="">— None —</option>
              {standards.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Link to Requirement</Label>
            <select className={selectClass} value={form.requirementId} onChange={set('requirementId')}>
              <option value="">— None —</option>
              {requirements.map(r => (
                <option key={r.id} value={r.id}>{r.code} — {r.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading || !selectedFile}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {loading
            ? (locale === 'ar' ? 'جارٍ الرفع...' : 'Uploading...')
            : (locale === 'ar' ? 'رفع الوثيقة' : 'Upload Document')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
