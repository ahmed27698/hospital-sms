import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations/auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/en/login',
    error: '/en/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const locale = nextUrl.pathname.split('/')[1] || 'en'
      const isAuthPage = nextUrl.pathname.includes('/login') || nextUrl.pathname.includes('/register') || nextUrl.pathname.includes('/forgot-password')
      const isDashboard = nextUrl.pathname.includes('/dashboard') || nextUrl.pathname.includes('/standards') || nextUrl.pathname.includes('/requirements')

      if (isDashboard) {
        if (isLoggedIn) return true
        return Response.redirect(new URL(`/${locale}/login`, nextUrl))
      }
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl))
      }
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.roleType = token.roleType as string
        session.user.departmentId = token.departmentId as string | undefined
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.roleType = (user as { roleType?: string }).roleType
        token.departmentId = (user as { departmentId?: string }).departmentId
      }
      return token
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { role: true },
        })

        if (!user || !user.password) return null
        if (user.status !== 'ACTIVE') return null

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password)
        if (!passwordMatch) return null

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role.name,
          roleType: user.role.type,
          departmentId: user.departmentId ?? undefined,
        }
      },
    }),
  ],
}
