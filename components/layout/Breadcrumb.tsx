import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Home className="w-3.5 h-3.5" />
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 opacity-50" />
          {item.href && i < items.length - 1
            ? <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
            : <span className={cn(i === items.length - 1 && 'text-foreground font-medium')}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}
