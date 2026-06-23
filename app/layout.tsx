import type { Metadata } from 'next'
import { headers, cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Hospital SMS', template: '%s | Hospital SMS' },
  description: 'Hospital Standards Management System',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()])

  const locale = headersList.get('X-NEXT-INTL-LOCALE') || 'en'
  const theme = cookieStore.get('theme')?.value
  const isDark = theme === 'dark'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir} className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
