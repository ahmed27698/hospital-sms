'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createUser } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  locale: string
  roles: { id: string; name: string; nameAr: string | null; type: string }[]
  departments: { id: string; name: string; nameAr: string }[]
  sections: { id: string; name: string; departmentId: string | null }[]
}

export function UserForm({ locale, roles, departments, sections }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    roleId: '', departmentId: '', sectionId: '',
    jobTitle: '', phone: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const filteredSections = form.departmentId
    ? sections.filter(s => s.departmentId === form.departmentId)
    : sections

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        roleId: form.roleId,
        departmentId: form.departmentId || undefined,
        sectionId: form.sectionId || undefined,
        jobTitle: form.jobTitle || undefined,
        phone: form.phone || undefined,
      })
      router.push(`/${locale}/users`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'h-9 text-sm'
  const labelClass = 'text-xs font-medium'
  const selectClass = 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Full Name <span className="text-destructive">*</span></Label>
            <Input className={inputClass} placeholder="Ahmed Khalid" value={form.name} onChange={set('name')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Email <span className="text-destructive">*</span></Label>
            <Input className={inputClass} type="email" placeholder="user@hospital.org" value={form.email} onChange={set('email')} required />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Job Title</Label>
            <Input className={inputClass} placeholder="Quality Officer" value={form.jobTitle} onChange={set('jobTitle')} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Phone</Label>
            <Input className={inputClass} type="tel" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={set('phone')} />
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'كلمة المرور' : 'Password'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                className={`${inputClass} pr-10`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase, number"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Min 8 characters, one uppercase, one number</p>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Confirm Password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                className={`${inputClass} pr-10`}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                required
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role & Department */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{locale === 'ar' ? 'الدور والقسم' : 'Role & Department'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Role <span className="text-destructive">*</span></Label>
            <select className={selectClass} value={form.roleId} onChange={set('roleId')} required>
              <option value="">— Select role —</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {locale === 'ar' && r.nameAr ? r.nameAr : r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Department</Label>
            <select
              className={selectClass}
              value={form.departmentId}
              onChange={e => setForm(prev => ({ ...prev, departmentId: e.target.value, sectionId: '' }))}
            >
              <option value="">— No department —</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{locale === 'ar' ? d.nameAr : d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Section</Label>
            <select className={selectClass} value={form.sectionId} onChange={set('sectionId')} disabled={filteredSections.length === 0}>
              <option value="">— No section —</option>
              {filteredSections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {locale === 'ar' ? 'إنشاء المستخدم' : 'Create User'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
