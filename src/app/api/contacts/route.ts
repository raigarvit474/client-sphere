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

    // Build where clause based on user role
    const allUsers = await prisma.user.findMany({ select: { id: true } })
    const accessibleUserIds = getAccessibleUserIds(
      user.role, 
      user.id, 
      allUsers.map(u => u.id)
    )

    const where: Record<string, any> = {
      ownerId: { in: accessibleUserIds }
    }

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