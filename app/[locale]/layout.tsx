import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { routing } from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'en' | 'ar')) notFound()

  const messages = await getMessages()
  const cookieStore = await cookies()
  const initialTheme = cookieStore.get('theme')?.value as 'light' | 'dark' | 'system' | undefined

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <NextIntlClientProvider messages={messages}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
