'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { registerUser } from '@/lib/actions/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await registerUser(form)
      router.push(`/${locale}/login?registered=1`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs">{t('name')}</Label>
        <Input id="name" placeholder="Ahmed Khalid" value={form.name} onChange={set('name')} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">{t('email')}</Label>
        <Input id="email" type="email" placeholder="user@hospital.org" value={form.email} onChange={set('email')} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs">{t('password')}</Label>
        <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
        <p className="text-[11px] text-muted-foreground">Min 8 chars, one uppercase, one number</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs">{t('confirmPassword')}</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {t('register')}
      </Button>
    </form>
  )
}
