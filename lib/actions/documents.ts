'use server'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createAuditLog } from './audit'
type DocumentType = 'POLICY' | 'PROCEDURE' | 'FORM' | 'GUIDELINE' | 'CIRCULAR' | 'SUPPORTING'
type DocumentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ARCHIVED' | 'REJECTED'
import type { PaginatedResult, DocumentWithRelations, TableFilters } from '@/types'

export async function getDocuments(filters: TableFilters & { type?: string } = {}): Promise<PaginatedResult<DocumentWithRelations>> {
  const { search, status, departmentId, type, page = 1, pageSize = 20, sortBy = 'createdAt', sortDir = 'desc' } = filters
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { titleAr: { contains: search, mode: 'insensitive' } },
      { fileName: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status as DocumentStatus
  if (type) where.type = type as DocumentType
  if (departmentId) where.departmentId = departmentId

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortDir },
      include: { uploadedBy: { select: { id: true, name: true } } },
    }),
    prisma.document.count({ where }),
  ])

  return {
    data: data as DocumentWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function uploadDocument(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const title = formData.get('title') as string
  const titleAr = formData.get('titleAr') as string
  const type = formData.get('type') as DocumentType
  const departmentId = formData.get('departmentId') as string | null
  const description = formData.get('description') as string | null
  const requirementId = formData.get('requirementId') as string | null
  const standardId = formData.get('standardId') as string | null

  if (!file || !title || !type) throw new Error('Missing required fields')

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760')
  if (file.size > maxSize) throw new Error('File size exceeds limit')

  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) throw new Error('File type not allowed')

  const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads')
  await mkdir(uploadDir, { recursive: true })

  const ext = extname(file.name)
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filePath = join(uploadDir, fileName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const document = await prisma.document.create({
    data: {
      title,
      titleAr: titleAr || null,
      type,
      status: 'DRAFT',
      version: '1.0',
      description: description || null,
      fileName: file.name,
      filePath: `/uploads/${fileName}`,
      fileSize: file.size,
      mimeType: file.type,
      uploadedById: session.user.id,
      departmentId: departmentId || null,
    },
  })

  if (requirementId || standardId) {
    await prisma.documentLink.create({
      data: {
        documentId: document.id,
        requirementId: requirementId || null,
        standardId: standardId || null,
      },
    })
  }

  await createAuditLog({
    action: 'UPLOAD',
    resource: 'document',
    resourceId: document.id,
    description: `Uploaded document: ${file.name}`,
  })

  revalidatePath('/[locale]/(dashboard)/documents', 'page')
  return document
}

export async function updateDocumentStatus(id: string, status: DocumentStatus) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const document = await prisma.document.update({
    where: { id },
    data: {
      status,
      approvedAt: status === 'APPROVED' ? new Date() : undefined,
      approvedById: status === 'APPROVED' ? session.user.id : undefined,
    },
  })

  await createAuditLog({
    action: status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'UPDATE',
    resource: 'document',
    resourceId: id,
    description: `Document status changed to ${status}`,
  })

  revalidatePath('/[locale]/(dashboard)/documents', 'page')
  return document
}

export async function deleteDocument(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const doc = await prisma.document.delete({ where: { id } })
  await createAuditLog({ action: 'DELETE', resource: 'document', resourceId: id, description: `Deleted document: ${doc.title}` })
  revalidatePath('/[locale]/(dashboard)/documents', 'page')
  return { success: true }
}
