import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { Hospital } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return { title: 'Forgot Password' }
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Hospital className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">{t('common.appName')}</span>
        </div>
        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-1">{t('auth.forgotPassword')}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {locale === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين' : "Enter your email and we'll send you a reset link"}
          </p>
          <ForgotPasswordForm locale={locale} />
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href={`/${locale}/login`} className="text-primary hover:underline">{t('auth.backToLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
