import { z } from 'zod'
import { Role, LeadStatus, DealStage, ActivityType, Priority } from '@prisma/client'

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
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
