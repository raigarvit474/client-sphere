import { hasPermission, hasRoleOrHigher, canAccessResource } from '../auth-utils'
import { Role } from '@prisma/client'

describe('Auth Utils', () => {
  describe('hasPermission', () => {
    it('should allow admin to create users', () => {
      expect(hasPermission(Role.ADMIN, 'USER_CREATE')).toBe(true)
    })

    it('should not allow rep to create users', () => {
      expect(hasPermission(Role.REP, 'USER_CREATE')).toBe(false)
    })

    it('should allow all roles to read contacts', () => {
      expect(hasPermission(Role.ADMIN, 'CONTACT_READ')).toBe(true)
      expect(hasPermission(Role.MANAGER, 'CONTACT_READ')).toBe(true)
      expect(hasPermission(Role.REP, 'CONTACT_READ')).toBe(true)
      expect(hasPermission(Role.READ_ONLY, 'CONTACT_READ')).toBe(true)
    })

    it('should not allow read-only users to create contacts', () => {
      expect(hasPermission(Role.READ_ONLY, 'CONTACT_CREATE')).toBe(false)
    })
  })

  describe('hasRoleOrHigher', () => {
    it('should return true for admin checking manager role', () => {
      expect(hasRoleOrHigher(Role.ADMIN, Role.MANAGER)).toBe(true)
    })

    it('should return false for rep checking manager role', () => {
      expect(hasRoleOrHigher(Role.REP, Role.MANAGER)).toBe(false)
    })

    it('should return true for same role', () => {
      expect(hasRoleOrHigher(Role.MANAGER, Role.MANAGER)).toBe(true)
    })
  })

  describe('canAccessResource', () => {
    it('should allow admin to access any resource', () => {
      expect(canAccessResource(Role.ADMIN, 'user1', 'user2')).toBe(true)
    })

    it('should allow manager to access any resource', () => {
      expect(canAccessResource(Role.MANAGER, 'user1', 'user2')).toBe(true)
    })

    it('should allow rep to access own resource', () => {
      expect(canAccessResource(Role.REP, 'user1', 'user1')).toBe(true)
    })

    it('should not allow rep to access other users resource', () => {
      expect(canAccessResource(Role.REP, 'user1', 'user2')).toBe(false)
    })
  })
})