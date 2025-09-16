import { Role } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

// Role hierarchy for permission checking
const roleHierarchy = {
  READ_ONLY: 0,
  REP: 1,
  MANAGER: 2,
  ADMIN: 3
}

// Permission definitions
export const permissions = {
  // User management
  USER_CREATE: [Role.ADMIN],
  USER_READ: [Role.ADMIN, Role.MANAGER, Role.REP, Role.READ_ONLY],
  USER_UPDATE: [Role.ADMIN, Role.MANAGER],
  USER_DELETE: [Role.ADMIN],
  
  // Contact management
  CONTACT_CREATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  CONTACT_READ: [Role.ADMIN, Role.MANAGER, Role.REP, Role.READ_ONLY],
  CONTACT_UPDATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  CONTACT_DELETE: [Role.ADMIN, Role.MANAGER],
  
  // Lead management
  LEAD_CREATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  LEAD_READ: [Role.ADMIN, Role.MANAGER, Role.REP, Role.READ_ONLY],
  LEAD_UPDATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  LEAD_DELETE: [Role.ADMIN, Role.MANAGER],
  
  // Deal management
  DEAL_CREATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  DEAL_READ: [Role.ADMIN, Role.MANAGER, Role.REP, Role.READ_ONLY],
  DEAL_UPDATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  DEAL_DELETE: [Role.ADMIN, Role.MANAGER],
  
  // Activity management
  ACTIVITY_CREATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  ACTIVITY_READ: [Role.ADMIN, Role.MANAGER, Role.REP, Role.READ_ONLY],
  ACTIVITY_UPDATE: [Role.ADMIN, Role.MANAGER, Role.REP],
  ACTIVITY_DELETE: [Role.ADMIN, Role.MANAGER],
  
  // Reports and analytics
  REPORTS_READ: [Role.ADMIN, Role.MANAGER, Role.READ_ONLY],
  ANALYTICS_READ: [Role.ADMIN, Role.MANAGER],
  
  // Import/Export
  IMPORT_DATA: [Role.ADMIN, Role.MANAGER],
  EXPORT_DATA: [Role.ADMIN, Role.MANAGER, Role.REP],
  
  // System settings
  SETTINGS_READ: [Role.ADMIN],
  SETTINGS_UPDATE: [Role.ADMIN]
} as const

export type Permission = keyof typeof permissions

// Check if user has specific permission
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return permissions[permission].includes(userRole)
}

// Check if user has higher or equal role
export function hasRoleOrHigher(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Get current user session server-side
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

// Require authentication (redirect to login if not authenticated)
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

// Require specific permission (throw error if not authorized)
export async function requirePermission(permission: Permission) {
  const user = await requireAuth()
  if (!hasPermission(user.role, permission)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

// Check if user can access resource owned by another user
export function canAccessResource(
  currentUserRole: Role,
  currentUserId: string,
  resourceOwnerId: string
): boolean {
  // Admins and Managers can access all resources
  if (hasRoleOrHigher(currentUserRole, Role.MANAGER)) {
    return true
  }
  
  // Regular users can only access their own resources
  return currentUserId === resourceOwnerId
}

// Get accessible user IDs based on role
export function getAccessibleUserIds(
  currentUserRole: Role,
  currentUserId: string,
  allUserIds: string[]
): string[] {
  // Admins and Managers can access all users
  if (hasRoleOrHigher(currentUserRole, Role.MANAGER)) {
    return allUserIds
  }
  
  // Regular users can only access their own data
  return [currentUserId]
}
