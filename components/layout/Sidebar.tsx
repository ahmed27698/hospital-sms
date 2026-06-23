'use client'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText, Users2,
  BarChart3, Bell, UserCog, ClipboardList, Settings, Hospital
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps { locale: string; unreadCount?: number }

export function Sidebar({ locale, unreadCount = 0 }: SidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const navItems = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: t('dashboard'), section: 'overview' },
    { href: `/${locale}/standards`, icon: BookOpen, label: t('standards'), section: 'accreditation' },
    { href: `/${locale}/requirements`, icon: CheckSquare, label: t('requirements'), section: 'accreditation' },
    { href: `/${locale}/documents`, icon: FileText, label: t('documents'), section: 'accreditation' },
    { href: `/${locale}/responsibilities`, icon: Users2, label: t('responsibilities'), section: 'management' },
    { href: `/${locale}/reports`, icon: BarChart3, label: t('reports'), section: 'management' },
    {
      href: `/${locale}/notifications`, icon: Bell, label: t('notifications'),
      badge: unreadCount > 0 ? unreadCount : undefined, section: 'management'
    },
    { href: `/${locale}/users`, icon: UserCog, label: t('users'), section: 'system' },
    { href: `/${locale}/audit-logs`, icon: ClipboardList, label: t('auditLogs'), section: 'system' },
    { href: `/${locale}/settings`, icon: Settings, label: t('settings'), section: 'system' },
  ]

  const sections = [
    { key: 'overview', label: locale === 'ar' ? 'نظرة عامة' : 'Overview' },
    { key: 'accreditation', label: locale === 'ar' ? 'الاعتماد' : 'Accreditation' },
    { key: 'management', label: locale === 'ar' ? 'الإدارة' : 'Management' },
    { key: 'system', label: locale === 'ar' ? 'النظام' : 'System' },
  ]

  return (
    <aside className="flex flex-col h-full w-[220px] border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Hospital className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{locale === 'ar' ? 'نظام المعايير' : 'Hospital SMS'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map(section => {
          const items = navItems.filter(i => i.section === section.key)
          return (
            <div key={section.key} className="mb-4">
              <p className="px-2 py-1 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
                {section.label}
              </p>
              {items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors mb-0.5',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
