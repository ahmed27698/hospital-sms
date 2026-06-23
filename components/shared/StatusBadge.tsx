import { cn, getStatusColor } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      getStatusColor(status),
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label || status.replace(/_/g, ' ')}
    </span>
  )
}
