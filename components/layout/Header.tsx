'use client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Sun, Moon, Globe, LogOut, User, Settings } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { UserWithRole } from '@/types'

interface HeaderProps {
  locale: string
  user: UserWithRole | null
  unreadCount?: number
}

export function Header({ locale, user, unreadCount = 0 }: HeaderProps) {
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const otherLocale = locale === 'en' ? 'ar' : 'en'

  const switchLocale = () => {
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(`/${locale}`, `/${otherLocale}`)
    router.push(newPath)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="h-14 border-b bg-card px-4 flex items-center justify-between gap-4 shrink-0">
      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Lang toggle */}
        <Button variant="ghost" size="sm" onClick={switchLocale} className="gap-1.5 h-8 px-2 text-xs font-medium">
          <Globe className="w-3.5 h-3.5" />
          {otherLocale === 'ar' ? 'العربية' : 'English'}
        </Button>

        {/* Theme */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" asChild>
          <Link href={`/${locale}/notifications`}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 h-8 px-2 ml-1">
              <Avatar className="w-6 h-6">
                <AvatarImage src={user?.image || ''} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs hidden sm:block max-w-[100px] truncate">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              <p className="text-xs text-primary font-normal mt-0.5">{user?.role?.name}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/settings`} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/login` })} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
