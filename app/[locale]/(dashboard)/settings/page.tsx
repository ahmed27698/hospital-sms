import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Building2, Bell, Palette, Shield } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'settings' })
  return { title: t('title') }
}

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return (
    <div>
      <Breadcrumb items={[
        { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
        { label: t('nav.settings') }
      ]} />
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Organization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {t('settings.organization')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.orgName')}</Label>
              <Input defaultValue="General Hospital" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.orgNameAr')}</Label>
              <Input defaultValue="المستشفى العام" className="h-9" dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.accreditationBody')}</Label>
              <Input defaultValue="Joint Commission International (JCI)" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.accreditationCycle')}</Label>
              <Input defaultValue="2024–2026" className="h-9" />
            </div>
            <Button size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailNotifications', label: t('settings.emailNotifications'), defaultChecked: true },
              { key: 'overdueAlerts', label: t('settings.overdueAlerts'), defaultChecked: true },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm cursor-pointer">{item.label}</Label>
                <Switch defaultChecked={item.defaultChecked} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.reminderDays')}</Label>
              <Input type="number" defaultValue="7" className="h-9 w-24" />
            </div>
            <Button size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" />
              {t('settings.appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">{t('settings.language')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={locale === 'en' ? 'default' : 'outline'} size="sm">🇬🇧 {t('settings.english')}</Button>
                <Button variant={locale === 'ar' ? 'default' : 'outline'} size="sm">🇸🇦 {t('settings.arabic')}</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t('settings.theme')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">☀️ Light</Button>
                <Button variant="outline" size="sm">🌙 Dark</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              {t('settings.security')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{t('settings.twoFactor')}</Label>
              <Switch />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('settings.sessionTimeout')}</Label>
              <Input type="number" defaultValue="60" className="h-9 w-24" />
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'دقيقة' : 'minutes'}</p>
            </div>
            <Button size="sm">{t('common.save')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
