import { z } from 'zod'
import { Role, LeadStatus, DealStage, ActivityType, Priority } from '@prisma/client'

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  isActive: z.boolean().optional().default(true)
})

export const updateUserSchema = createUserSchema.partial()

// Contact schemas
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([])
})

export const updateContactSchema = createContactSchema.partial()

// Lead schemas
export const createLeadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  source: z.string().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  // Remove invalid fields that don't exist in Prisma schema
  // score: z.number().min(0).max(100).optional(), // Not in schema
  estimatedValue: z.number().min(0).optional(), // Maps to value field in Prisma
  // expectedCloseDate: z.string().optional(), // Not in schema
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  contactId: z.string().optional()
})

export const updateLeadSchema = createLeadSchema.partial()

// Deal schemas
export const createDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.nativeEnum(DealStage).default(DealStage.PROSPECTING),
  probability: z.number().min(0).max(100, 'Probability must be between 0-100').default(0),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  contactId: z.string().optional(),
  leadId: z.string().optional()
})

export const updateDealSchema = createDealSchema.partial()

// Activity schemas
export const createActivitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.nativeEnum(ActivityType),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
  assigneeId: z.string().optional(),
  isCompleted: z.boolean().optional().default(false),
  reminderMinutes: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
})

export const updateActivitySchema = createActivitySchema.partial()
export const completeActivitySchema = z.object({
  isCompleted: z.boolean()
})

// Query schemas
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
})

export const filterSchema = z.object({
  status: z.string().optional(),
  stage: z.string().optional(),
  owner: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
})
