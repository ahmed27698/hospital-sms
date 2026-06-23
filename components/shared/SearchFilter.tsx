'use client'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  placeholder?: string
  onSearch: (value: string) => void
  className?: string
  defaultValue?: string
}

export function SearchFilter({ placeholder = 'Search…', onSearch, className, defaultValue = '' }: SearchFilterProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (v: string) => {
    setValue(v)
    onSearch(v)
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9"
      />
      {value && (
        <button onClick={() => handleChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
