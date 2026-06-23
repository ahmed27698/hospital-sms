import { z } from 'zod'

export const standardSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20),
  title: z.string().min(2, 'Title is required'),
  titleAr: z.string().min(2, 'Arabic title is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  chapterCode: z.string().min(1, 'Chapter code is required'),
  chapterTitle: z.string().min(1, 'Chapter title is required'),
  chapterTitleAr: z.string().min(1, 'Arabic chapter title is required'),
  parentId: z.string().optional(),
  level: z.number().min(1).max(4).default(1),
  orderIndex: z.number().default(0),
  ownerId: z.string().optional(),
  backupOwnerId: z.string().optional(),
  departmentId: z.string().optional(),
  sectionId: z.string().optional(),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
})

export type StandardInput = z.infer<typeof standardSchema>
