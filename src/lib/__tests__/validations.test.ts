import { createContactSchema, createLeadSchema, paginationSchema } from '../validations'
import { Role, LeadStatus } from '@prisma/client'

describe('Validation Schemas', () => {
  describe('createContactSchema', () => {
    it('should validate valid contact data', () => {
      const validContact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        company: 'Tech Corp'
      }

      expect(() => createContactSchema.parse(validContact)).not.toThrow()
    })

    it('should require firstName and lastName', () => {
      const invalidContact = {
        email: 'john@example.com'
      }

      expect(() => createContactSchema.parse(invalidContact)).toThrow()
    })

    it('should validate email format', () => {
      const invalidContact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email'
      }

      expect(() => createContactSchema.parse(invalidContact)).toThrow()
    })
  })

  describe('createLeadSchema', () => {
    it('should validate valid lead data', () => {
      const validLead = {
        title: 'Enterprise Deal',
        company: 'Tech Corp',
        value: 50000,
        status: LeadStatus.NEW
      }

      expect(() => createLeadSchema.parse(validLead)).not.toThrow()
    })

    it('should require title', () => {
      const invalidLead = {
        company: 'Tech Corp'
      }

      expect(() => createLeadSchema.parse(invalidLead)).toThrow()
    })

    it('should set default status to NEW', () => {
      const lead = {
        title: 'Test Lead'
      }

      const parsed = createLeadSchema.parse(lead)
      expect(parsed.status).toBe(LeadStatus.NEW)
    })
  })

  describe('paginationSchema', () => {
    it('should parse valid pagination params', () => {
      const params = {
        page: '2',
        limit: '20',
        search: 'test',
        sortOrder: 'asc' as const
      }

      const parsed = paginationSchema.parse(params)
      expect(parsed.page).toBe(2)
      expect(parsed.limit).toBe(20)
      expect(parsed.search).toBe('test')
      expect(parsed.sortOrder).toBe('asc')
    })

    it('should set defaults for missing params', () => {
      const params = {}

      const parsed = paginationSchema.parse(params)
      expect(parsed.page).toBe(1)
      expect(parsed.limit).toBe(10)
      expect(parsed.sortOrder).toBe('desc')
    })

    it('should limit maximum page size', () => {
      const params = {
        limit: '1000'
      }

      const parsed = paginationSchema.parse(params)
      expect(parsed.limit).toBe(100) // Should be capped at 100
    })
  })
})