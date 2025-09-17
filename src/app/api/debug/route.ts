import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    // Get all contacts (without filtering)
    const allContacts = await prisma.contact.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    })

    return successResponse({
      currentUser: user,
      totalContacts: allContacts.length,
      contacts: allContacts,
      totalUsers: allUsers.length,
      users: allUsers,
      debug: {
        timestamp: new Date().toISOString(),
        authenticated: !!user,
        userId: user?.id || null,
        userRole: user?.role || null
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}