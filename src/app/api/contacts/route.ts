import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, parseQueryParams } from '@/lib/api-utils'
import { createContactSchema } from '@/lib/validations'
import { requirePermission, getAccessibleUserIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('CONTACT_READ')
    const params = parseQueryParams(request)
    
    const { page, limit, search, sortBy, sortOrder } = params
    const skip = (page - 1) * limit

    console.log('Contacts API - User:', { id: user.id, role: user.role, email: user.email })
    console.log('Contacts API - Query params:', params)

    // Build where clause - for debugging, let's be more lenient with permissions
    const where: Record<string, any> = {}
    
    // Only apply ownership filter for non-admin/manager users
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      where.ownerId = user.id
    }
    // Admins and Managers can see all contacts
    
    console.log('Contacts API - Where clause:', where)

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.contact.count({ where })
    ])
    
    console.log('Contacts API - Query results:', { 
      totalFound: total, 
      contactsReturned: contacts.length,
      contactIds: contacts.map(c => ({ id: c.id, owner: c.ownerId })) 
    })
    
    // Log detailed count information for debugging
    console.log('Contacts API - Detailed counts:')
    contacts.forEach(contact => {
      console.log(`Contact ${contact.id} (${contact.firstName} ${contact.lastName}):`, {
        leads: contact._count.leads,
        deals: contact._count.deals,
        activities: contact._count.activities
      })
    })

    return successResponse({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('CONTACT_CREATE')
    const body = await request.json()
    const validatedData = createContactSchema.parse(body)

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        ownerId: user.id
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return successResponse(contact, 201)
  } catch (error) {
    return handleApiError(error)
  }
}