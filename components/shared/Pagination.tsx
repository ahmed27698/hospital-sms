'use client'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total} results
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={page === 1} className="h-8 w-8">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-3 py-1 rounded border bg-background">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="icon" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className="h-8 w-8">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
