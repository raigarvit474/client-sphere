import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse } from '@/lib/api-utils'
import { createActivitySchema, updateActivitySchema } from '@/lib/validations'
import { requirePermission } from '@/lib/auth-utils'

// GET /api/activities/[id] - Get single activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('ACTIVITY_READ')
    const { id: activityId } = await params

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true }
        },
        deal: {
          select: { id: true, title: true, value: true }
        },
        lead: {
          select: { id: true, title: true, firstName: true, lastName: true }
        }
      }
    })

    if (!activity) {
      return Response.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only view activities they created or are assigned to (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (activity.createdById !== user.id && activity.assigneeId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    return successResponse(activity)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/activities/[id] - Update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('ACTIVITY_UPDATE')
    const { id: activityId } = await params
    const body = await request.json()

    // First check if activity exists and user has permission
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, createdById: true, assigneeId: true }
    })

    if (!existingActivity) {
      return Response.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only update activities they created or are assigned to (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingActivity.createdById !== user.id && existingActivity.assigneeId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Validate the update data
    const validatedData = updateActivitySchema.parse(body)

    // Handle due date combination
    let dueDate = undefined
    if (validatedData.dueDate) {
      try {
        const dateInput = validatedData.dueDate.trim()
        
        if (dateInput.includes('T')) {
          dueDate = new Date(dateInput)
        } else {
          const timeStr = validatedData.dueTime?.trim() || '23:59'
          const isoString = `${dateInput}T${timeStr}:00.000Z`
          dueDate = new Date(isoString)
        }
        
        if (isNaN(dueDate.getTime())) {
          dueDate = undefined
        }
      } catch (error) {
        console.error('Date parsing error:', error)
        dueDate = undefined
      }
    }

    // Build data object with only valid Prisma fields
    const prismaData: any = {}
    
    console.log('Activity API - Validated data:', validatedData)
    console.log('Activity API - Due date processing:', { original: validatedData.dueDate, processed: dueDate })
    
    // Map form fields to Prisma fields
    if (validatedData.title !== undefined) prismaData.title = validatedData.title
    
    // Handle description field - prioritize description over notes
    if (validatedData.description !== undefined) {
      prismaData.description = validatedData.description
    } else if (validatedData.notes !== undefined) {
      prismaData.description = validatedData.notes
    }
    
    if (validatedData.type !== undefined) prismaData.type = validatedData.type
    if (validatedData.priority !== undefined) prismaData.priority = validatedData.priority
    if (validatedData.isCompleted !== undefined) prismaData.isCompleted = validatedData.isCompleted
    
    // Handle optional foreign key fields - convert empty strings to null
    if (validatedData.contactId !== undefined) {
      prismaData.contactId = validatedData.contactId === '' ? null : validatedData.contactId
    }
    if (validatedData.leadId !== undefined) {
      prismaData.leadId = validatedData.leadId === '' ? null : validatedData.leadId
    }
    if (validatedData.dealId !== undefined) {
      prismaData.dealId = validatedData.dealId === '' ? null : validatedData.dealId
    }
    if (validatedData.assigneeId !== undefined && validatedData.assigneeId !== '') {
      prismaData.assigneeId = validatedData.assigneeId
    }
    
    if (dueDate !== undefined) prismaData.dueDate = dueDate
    
    console.log('Activity API - Prisma data:', prismaData)
    
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: prismaData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, value: true }
        },
        lead: {
          select: { id: true, title: true, firstName: true, lastName: true }
        }
      }
    }).catch((error) => {
      console.error('Activity API - Prisma update error:', error)
      throw error
    })

    return successResponse(updatedActivity)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/activities/[id] - Update specific fields (like completion status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('ACTIVITY_UPDATE')
    const { id: activityId } = await params
    const body = await request.json()

    // First check if activity exists and user has permission
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, createdById: true, assigneeId: true }
    })

    if (!existingActivity) {
      return Response.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only update activities they created or are assigned to (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingActivity.createdById !== user.id && existingActivity.assigneeId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Allow updating specific fields
    const allowedUpdates: Record<string, any> = {}
    
    if (body.isCompleted !== undefined) {
      allowedUpdates.isCompleted = body.isCompleted
      allowedUpdates.completedAt = body.isCompleted ? new Date() : null
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: allowedUpdates,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, value: true }
        },
        lead: {
          select: { id: true, title: true, firstName: true, lastName: true }
        }
      }
    })

    return successResponse(updatedActivity)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/activities/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('ACTIVITY_DELETE')
    const { id: activityId } = await params

    // First check if activity exists and user has permission
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, createdById: true, assigneeId: true, title: true }
    })

    if (!existingActivity) {
      return Response.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only delete activities they created or are assigned to (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingActivity.createdById !== user.id && existingActivity.assigneeId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    await prisma.activity.delete({
      where: { id: activityId }
    })

    return successResponse(
      { message: 'Activity deleted successfully', activityId },
      200
    )
  } catch (error) {
    return handleApiError(error)
  }
}