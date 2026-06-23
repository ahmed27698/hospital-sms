import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

export const prisma: PrismaClient = globalThis._prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') globalThis._prisma = prisma

export default prisma
