import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

const handleI18n = createMiddleware(routing)

export function proxy(request: NextRequest) {
  return handleI18n(request)
}

export const config = {
  // Match all paths except _next internals, static assets, and files with extensions
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
