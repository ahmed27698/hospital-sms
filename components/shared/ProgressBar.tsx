import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  colorClass?: string
  className?: string
}

export function ProgressBar({ value, max = 100, size = 'md', showLabel = false, colorClass, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const color = colorClass || (pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-muted overflow-hidden', heights[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs text-muted-foreground w-9 text-right">{pct}%</span>}
    </div>
  )
}
