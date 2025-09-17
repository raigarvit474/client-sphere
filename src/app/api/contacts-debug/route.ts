import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get ALL contacts without role-based filtering for debugging
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: {
              leads: true,
              deals: true,
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contact.count()
    ])

    // Also get contacts specifically for this user
    const userContacts = await prisma.contact.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return successResponse({
      debug: {
        currentUserId: user.id,
        currentUserRole: user.role,
        totalContactsInDB: total,
        contactsOwnedByUser: userContacts.length,
        allContacts: contacts.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          ownerId: c.ownerId,
          ownerName: c.owner.name
        }))
      },
      contacts,
      pagination: {
        page: 1,
        limit: 100,
        total,
        pages: 1
      }
    })
  } catch (error) {
    console.error('Debug contacts API error:', error)
    return handleApiError(error)
  }
}