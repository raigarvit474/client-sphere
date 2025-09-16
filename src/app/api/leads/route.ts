import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, parseQueryParams } from '@/lib/api-utils'
import { createLeadSchema } from '@/lib/validations'
import { requirePermission, getAccessibleUserIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('LEAD_READ')
    const params = parseQueryParams(request)
    
    const { page, limit, search, sortBy, sortOrder, status } = params
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
        { title: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          deal: {
            select: { id: true, title: true, value: true, stage: true }
          },
          _count: {
            select: {
              activities: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.lead.count({ where })
    ])

    return successResponse({
      leads,
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
    const user = await requirePermission('LEAD_CREATE')
    const body = await request.json()
    const validatedData = createLeadSchema.parse(body)

    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
        ownerId: user.id
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    })

    return successResponse(lead, 201)
  } catch (error) {
    return handleApiError(error)
  }
}