'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createRequirement } from '@/lib/actions/requirements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  locale: string
  standards: { id: string; code: string; title: string }[]
  departments: { id: string; name: string; nameAr: string }[]
  users: { id: string; name: string }[]
  defaultStandardId?: string
}

export function RequirementForm({ locale, standards, departments, users, defaultStandardId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '', title: '', titleAr: '',
    description: '',
    standardId: defaultStandardId || '',
    status: 'NOT_STARTED',
    priority: '2',
    dueDate: '',
    ownerId: '', departmentId: '', sectionId: '',
    evidence: '', completionNotes: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createRequirement({
        code: form.code,
        title: form.title,
        titleAr: form.titleAr,
        description: form.description || undefined,
        standardId: form.standardId,
        status: form.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'OVERDUE' | 'WAIVED',
        priority: parseInt(form.priority),
        dueDate: form.dueDate || undefined,
        ownerId: form.ownerId || undefined,
        departmentId: form.departmentId || undefined,
        sectionId: form.sectionId || undefined,
        evidence: form.evidence || undefined,
        completionNotes: form.completionNotes || undefined,
      })
      router.push(`/${locale}/requirements`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create requirement')
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

      {/* Core fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'التعريف' : 'Identification'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Code <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="e.g. ACC.1.1" value={form.code} onChange={set('code')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Standard <span className="text-destructive">*</span></Label>
            <select className={selectClass} value={form.standardId} onChange={set('standardId')} required>
              <option value="">— Select standard —</option>
              {standards.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (English) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="Requirement title" value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Title (Arabic) <span className="text-destructive">*</span></Label>
            <Input className={inputClass} dir="rtl" placeholder="عنوان المتطلب" value={form.titleAr} onChange={set('titleAr')} required />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass}>Description</Label>
            <Textarea className="text-sm min-h-[70px]" placeholder="Optional description..." value={form.description} onChange={set('description')} />
          </div>
        </CardContent>
      </Card>

      {/* Status & Priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'الحالة والأولوية' : 'Status & Priority'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Status</Label>
            <select className={selectClass} value={form.status} onChange={set('status')}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="WAIVED">Waived</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Priority</Label>
            <select className={selectClass} value={form.priority} onChange={set('priority')}>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Due Date</Label>
            <Input className={inputClass} type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </CardContent>
      </Card>

      {/* Ownership */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'المسؤولية' : 'Ownership'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Owner</Label>
            <select className={selectClass} value={form.ownerId} onChange={set('ownerId')}>
              <option value="">— No owner —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
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
          <div className="space-y-1.5">
            <Label className={labelClass}>Evidence</Label>
            <Input className={inputClass} placeholder="Evidence description or link" value={form.evidence} onChange={set('evidence')} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Completion Notes</Label>
            <Input className={inputClass} placeholder="Notes on completion..." value={form.completionNotes} onChange={set('completionNotes')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {locale === 'ar' ? 'إنشاء المتطلب' : 'Create Requirement'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
