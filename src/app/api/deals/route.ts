import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, parseQueryParams } from '@/lib/api-utils'
import { createDealSchema } from '@/lib/validations'
import { requirePermission, getAccessibleUserIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('DEAL_READ')
    const params = parseQueryParams(request)
    
    const { page, limit, search, sortBy, sortOrder } = params
    const stage = (params as any).stage // Extract stage separately
    const skip = (page - 1) * limit

    console.log('Deals API - User:', { id: user.id, role: user.role, email: user.email })
    console.log('Deals API - Query params:', params)

    // Build where clause - simplified permission logic
    const where: Record<string, any> = {}
    
    // Only apply ownership filter for non-admin/manager users
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      where.ownerId = user.id
    }
    // Admins and Managers can see all deals
    
    console.log('Deals API - Where clause:', where)

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { contact: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    if (stage) {
      where.stage = stage
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true, company: true }
          },
          lead: {
            select: { id: true, title: true, firstName: true, lastName: true }
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
      prisma.deal.count({ where })
    ])
    
    console.log('Deals API - Query results:', { 
      totalFound: total, 
      dealsReturned: deals.length,
      dealIds: deals.map(d => ({ id: d.id, owner: d.ownerId })) 
    })

    return successResponse({
      deals,
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
    const user = await requirePermission('DEAL_CREATE')
    const body = await request.json()
    console.log('Deals API - Creating deal with data:', body)
    const validatedData = createDealSchema.parse(body)
    console.log('Deals API - Validated data:', { ...validatedData, contactId: validatedData.contactId })

    // Convert expectedCloseDate string to DateTime if provided
    let expectedCloseDate = null
    if (validatedData.expectedCloseDate) {
      expectedCloseDate = new Date(validatedData.expectedCloseDate + 'T00:00:00.000Z')
    }

    const deal = await prisma.deal.create({
      data: {
        title: validatedData.title,
        value: validatedData.value,
        stage: validatedData.stage,
        probability: validatedData.probability,
        expectedCloseDate: expectedCloseDate,
        source: validatedData.source,
        notes: validatedData.notes,
        tags: validatedData.tags || [],
        contactId: validatedData.contactId,
        leadId: validatedData.leadId,
        ownerId: user.id
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, company: true }
        },
        lead: {
          select: { id: true, title: true, firstName: true, lastName: true }
        },
        _count: {
          select: {
            activities: true
          }
        }
      }
    })

    return successResponse(deal, 201)
  } catch (error) {
    return handleApiError(error)
  }
}