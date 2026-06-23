import { z } from 'zod'

export const requirementSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  title: z.string().min(2, 'Title is required'),
  titleAr: z.string().min(2, 'Arabic title is required').optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  standardId: z.string().min(1, 'Standard is required'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'OVERDUE', 'WAIVED']).default('NOT_STARTED'),
  priority: z.number().min(1).max(3).default(2),
  dueDate: z.string().optional(),
  ownerId: z.string().optional(),
  departmentId: z.string().optional(),
  sectionId: z.string().optional(),
  evidence: z.string().optional(),
  completionNotes: z.string().optional(),
})

export type RequirementInput = z.infer<typeof requirementSchema>
