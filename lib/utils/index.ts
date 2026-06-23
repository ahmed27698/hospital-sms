import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { ar } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined, locale = 'en'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy', { locale: locale === 'ar' ? ar : undefined })
}

export function formatDateRelative(date: Date | string | null | undefined, locale = 'en'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'ar' ? ar : undefined })
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return isPast(d)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    WAIVED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    SUSPENDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getPriorityLabel(priority: number, locale = 'en'): string {
  const labels: Record<number, { en: string; ar: string }> = {
    1: { en: 'Low', ar: 'منخفض' },
    2: { en: 'Medium', ar: 'متوسط' },
    3: { en: 'High', ar: 'عالي' },
  }
  return labels[priority]?.[locale as 'en' | 'ar'] || 'Medium'
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function generateCode(prefix: string, index: number): string {
  return `${prefix}.${String(index).padStart(2, '0')}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
