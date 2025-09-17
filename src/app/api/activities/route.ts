import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, parseQueryParams } from '@/lib/api-utils'
import { createActivitySchema } from '@/lib/validations'
import { requirePermission, getAccessibleUserIds } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('ACTIVITY_READ')
    const params = parseQueryParams(request)
    
    const { page, limit, search, sortBy, sortOrder } = params
    const skip = (page - 1) * limit

    console.log('Activities API - User:', { id: user.id, role: user.role, email: user.email })
    console.log('Activities API - Query params:', params)

    // Build where clause - simplified permission logic
    const where: Record<string, any> = {}
    
    // Only apply ownership filter for non-admin/manager users
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      where.OR = [
        { createdById: user.id },
        { assigneeId: user.id }
      ]
    }
    // Admins and Managers can see all activities
    
    console.log('Activities API - Where clause:', where)

    if (search) {
      where.AND = [
        where.OR ? { OR: where.OR } : {},
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } }
          ]
        }
      ]
      delete where.OR
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          deal: {
            select: { id: true, title: true, value: true }
          },
          lead: {
            select: { id: true, title: true, firstName: true, lastName: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.activity.count({ where })
    ])
    
    console.log('Activities API - Query results:', { 
      totalFound: total, 
      activitiesReturned: activities.length,
      activityIds: activities.map(a => ({ id: a.id, createdBy: a.createdById, assignee: a.assigneeId })) 
    })

    return successResponse({
      activities,
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
    const user = await requirePermission('ACTIVITY_CREATE')
    const body = await request.json()
    const validatedData = createActivitySchema.parse(body)

    // Combine date and time into a single DateTime if both are provided
    let dueDate = null
    if (validatedData.dueDate && validatedData.dueDate.trim() !== '') {
      try {
        const dateInput = validatedData.dueDate.trim()
        
        // Check if the dateInput is already a full ISO timestamp
        if (dateInput.includes('T')) {
          // It's already a timestamp, just use it
          dueDate = new Date(dateInput)
        } else {
          // It's just a date, combine with time
          const timeStr = validatedData.dueTime?.trim() || '23:59'
          const isoString = `${dateInput}T${timeStr}:00.000Z`
          dueDate = new Date(isoString)
        }
        
        console.log('Activities API - Creating date from:', dateInput, 'Result:', dueDate)
        
        // Validate the date is not Invalid
        if (isNaN(dueDate.getTime())) {
          console.error('Activities API - Invalid date created from:', dateInput)
          dueDate = null
        }
      } catch (error) {
        console.error('Activities API - Date parsing error:', error)
        dueDate = null
      }
    }
    
    console.log('Activities API - Final dueDate:', dueDate)

    const activity = await prisma.activity.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        priority: validatedData.priority,
        dueDate: dueDate,
        contactId: validatedData.contactId,
        leadId: validatedData.leadId,
        dealId: validatedData.dealId,
        isCompleted: validatedData.isCompleted || false,
        createdById: user.id,
        assigneeId: validatedData.assigneeId || user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        deal: {
          select: { id: true, title: true, value: true }
        },
        lead: {
          select: { id: true, title: true, firstName: true, lastName: true }
        }
      }
    })

    return successResponse(activity, 201)
  } catch (error) {
    return handleApiError(error)
  }
}