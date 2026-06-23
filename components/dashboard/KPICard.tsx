import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string; positive?: boolean }
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  className?: string
}

const colors = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' },
  green: { bg: 'bg-green-50 dark:bg-green-950/30', icon: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900' },
  red: { bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-900' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900' },
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'blue', className }: KPICardProps) {
  const c = colors[color]
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <p className={cn('text-xs mt-2 font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
                {trend.positive ? '↑' : '↓'} {trend.value} {trend.label}
              </p>
            )}
          </div>
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', c.bg)}>
            <Icon className={cn('w-5 h-5', c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
