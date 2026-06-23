'use client'
import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000)) // mock delay
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="font-medium">{t('emailSent')}</p>
        <p className="text-sm text-muted-foreground mt-1">{email}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">{t('email')}</Label>
        <Input
          id="email" type="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="user@hospital.org"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {t('sendResetLink')}
      </Button>
    </form>
  )
}
