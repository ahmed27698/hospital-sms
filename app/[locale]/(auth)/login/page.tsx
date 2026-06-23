import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/LoginForm'
import { Hospital } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: t('login') }
}

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ registered?: string }> }) {
  const { locale } = await params
  const { registered } = await searchParams
  const t = await getTranslations({ locale })

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-lg">{t('common.appName')}</p>
              <p className="text-xs text-primary-foreground/70">{t('common.appSubtitle')}</p>
            </div>
          </div>
          <div className="mt-auto">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              {locale === 'ar' ? 'نظام إدارة معايير الاعتماد' : 'Accreditation Standards Management'}
            </h2>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {locale === 'ar'
                ? 'منصة شاملة لإدارة معايير الجودة ومتطلبات الاعتماد والوثائق في المستشفيات'
                : 'A comprehensive platform for managing quality standards, accreditation requirements and documents in hospitals.'}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { n: '300+', l: locale === 'ar' ? 'معيار' : 'Standards' },
                { n: '1200+', l: locale === 'ar' ? 'متطلب' : 'Requirements' },
                { n: '85%', l: locale === 'ar' ? 'نسبة الاكتمال' : 'Completion Rate' },
                { n: '24/7', l: locale === 'ar' ? 'مراقبة' : 'Monitoring' },
              ].map(item => (
                <div key={item.n} className="bg-primary-foreground/10 rounded-xl p-4">
                  <p className="text-2xl font-bold">{item.n}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{item.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Hospital className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">{t('common.appName')}</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{t('auth.login')}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            {locale === 'ar' ? 'أدخل بيانات اعتمادك للمتابعة' : 'Enter your credentials to continue'}
          </p>
          {registered && (
            <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {locale === 'ar' ? '✅ تم إنشاء حسابك. يمكنك تسجيل الدخول الآن.' : '✅ Account created! You can now sign in.'}
            </div>
          )}
          <LoginForm locale={locale} />
        </div>
      </div>
    </div>
  )
}
