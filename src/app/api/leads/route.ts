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

    console.log('Leads API - User:', { id: user.id, role: user.role, email: user.email })
    console.log('Leads API - Query params:', params)

    // Build where clause - simplified permission logic
    const where: Record<string, any> = {}
    
    // Only apply ownership filter for non-admin/manager users
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      where.ownerId = user.id
    }
    // Admins and Managers can see all leads
    
    console.log('Leads API - Where clause:', where)

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
    
    console.log('Leads API - Query results:', { 
      totalFound: total, 
      leadsReturned: leads.length,
      leadIds: leads.map(l => ({ id: l.id, owner: l.ownerId })) 
    })

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
    console.log('Leads API - Creating lead with data:', body)
    const validatedData = createLeadSchema.parse(body)
    console.log('Leads API - Validated data:', { ...validatedData, contactId: validatedData.contactId })

    const lead = await prisma.lead.create({
      data: {
        title: validatedData.title,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        position: validatedData.position,
        source: validatedData.source,
        status: validatedData.status,
        value: validatedData.estimatedValue, // Map estimatedValue to value field
        notes: validatedData.notes,
        tags: validatedData.tags || [],
        contactId: validatedData.contactId, // Associate with contact if provided
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