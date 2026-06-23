'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(Ctx)
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyClass(theme: Theme): 'light' | 'dark' {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  return resolved
}

function setCookie(value: string) {
  document.cookie = `theme=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme?: 'light' | 'dark' | 'system'
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme || 'system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    initialTheme === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || initialTheme || 'system'
    setThemeState(saved)
    setResolvedTheme(applyClass(saved))

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if ((localStorage.getItem('theme') || 'system') === 'system') {
        setResolvedTheme(applyClass('system'))
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem('theme', t)
    setCookie(t)
    setThemeState(t)
    setResolvedTheme(applyClass(t))
  }, [])

  return <Ctx.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</Ctx.Provider>
}
