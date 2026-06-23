import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { getUnreadCount } from '@/lib/actions/notifications'
import type { UserWithRole } from '@/types'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        department: true,
        section: true,
      },
    }),
    getUnreadCount(session.user.id),
  ])

  if (!user) redirect(`/${locale}/login`)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar locale={locale} unreadCount={unreadCount} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header locale={locale} user={user as UserWithRole} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
