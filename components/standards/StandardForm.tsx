'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createStandard } from '@/lib/actions/standards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  locale: string
  departments: { id: string; name: string; nameAr: string }[]
  users: { id: string; name: string }[]
  parentStandards: { id: string; code: string; title: string }[]
}

export function StandardForm({ locale, departments, users, parentStandards }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '', title: '', titleAr: '',
    description: '', descriptionAr: '',
    chapterCode: '', chapterTitle: '', chapterTitleAr: '',
    level: '1', orderIndex: '0',
    parentId: '', ownerId: '', backupOwnerId: '',
    departmentId: '', sectionId: '',
    effectiveDate: '', reviewDate: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createStandard({
        code: form.code,
        title: form.title,
        titleAr: form.titleAr,
        description: form.description || undefined,
        descriptionAr: form.descriptionAr || undefined,
        chapterCode: form.chapterCode,
        chapterTitle: form.chapterTitle,
        chapterTitleAr: form.chapterTitleAr,
        level: parseInt(form.level) || 1,
        orderIndex: parseInt(form.orderIndex) || 0,
        parentId: form.parentId || undefined,
        ownerId: form.ownerId || undefined,
        backupOwnerId: form.backupOwnerId || undefined,
        departmentId: form.departmentId || undefined,
        sectionId: form.sectionId || undefined,
        effectiveDate: form.effectiveDate || undefined,
        reviewDate: form.reviewDate || undefined,
      })
      router.push(`/${locale}/standards`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create standard')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'h-9 text-sm'
  const labelClass = 'text-xs font-medium'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Identification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'التعريف' : 'Identification'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Code <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="e.g. ACC.1.1" value={form.code} onChange={set('code')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Level</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.level} onChange={set('level')}>
              <option value="1">Level 1 (Chapter)</option>
              <option value="2">Level 2 (Standard)</option>
              <option value="3">Level 3 (Sub-Standard)</option>
              <option value="4">Level 4 (Sub-Sub)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Order Index</Label>
            <Input className={inputClass} type="number" min="0" value={form.orderIndex} onChange={set('orderIndex')} />
          </div>
        </CardContent>
      </Card>

      {/* Titles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'العناوين' : 'Titles'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (English) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="Standard title in English" value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (Arabic) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} dir="rtl" placeholder="عنوان المعيار بالعربية" value={form.titleAr} onChange={set('titleAr')} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass}>Description (English)</Label>
            <Textarea className="text-sm min-h-[70px]" placeholder="Optional description..." value={form.description} onChange={set('description')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass}>Description (Arabic)</Label>
            <Textarea className="text-sm min-h-[70px]" dir="rtl" placeholder="وصف اختياري..." value={form.descriptionAr} onChange={set('descriptionAr')} />
          </div>
        </CardContent>
      </Card>

      {/* Chapter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'الفصل' : 'Chapter'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Chapter Code <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="e.g. ACC" value={form.chapterCode} onChange={set('chapterCode')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Chapter Title (EN) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="Chapter title" value={form.chapterTitle} onChange={set('chapterTitle')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Chapter Title (AR) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} dir="rtl" placeholder="عنوان الفصل" value={form.chapterTitleAr} onChange={set('chapterTitleAr')} required />
          </div>
        </CardContent>
      </Card>

      {/* Relations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'المسؤوليات والعلاقات' : 'Ownership & Relations'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Parent Standard</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.parentId} onChange={set('parentId')}>
              <option value="">— No parent (top-level) —</option>
              {parentStandards.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Department</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.departmentId} onChange={set('departmentId')}>
              <option value="">— No department —</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Owner</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.ownerId} onChange={set('ownerId')}>
              <option value="">— No owner —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Backup Owner</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={form.backupOwnerId} onChange={set('backupOwnerId')}>
              <option value="">— No backup owner —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Effective Date</Label>
            <Input className={inputClass} type="date" value={form.effectiveDate} onChange={set('effectiveDate')} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Review Date</Label>
            <Input className={inputClass} type="date" value={form.reviewDate} onChange={set('reviewDate')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {locale === 'ar' ? 'إنشاء المعيار' : 'Create Standard'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
