import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse } from '@/lib/api-utils'
import { createDealSchema } from '@/lib/validations'
import { requirePermission } from '@/lib/auth-utils'

// GET /api/deals/[id] - Get single deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('DEAL_READ')
    const { id: dealId } = await params

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, company: true, phone: true }
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

    if (!deal) {
      return Response.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only view their own deals (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (deal.ownerId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    return successResponse(deal)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/deals/[id] - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('DEAL_UPDATE')
    const { id: dealId } = await params
    const body = await request.json()

    // First check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { id: true, ownerId: true }
    })

    if (!existingDeal) {
      return Response.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only update their own deals (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingDeal.ownerId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Validate the update data
    const validatedData = createDealSchema.partial().parse(body)

    // Convert expectedCloseDate string to DateTime if provided
    let expectedCloseDate = undefined
    if (validatedData.expectedCloseDate) {
      expectedCloseDate = new Date(validatedData.expectedCloseDate + 'T00:00:00.000Z')
    }

    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        ...validatedData,
        expectedCloseDate,
        // Don't allow changing the owner through this endpoint
        ownerId: undefined
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

    return successResponse(updatedDeal)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('DEAL_DELETE')
    const { id: dealId } = await params

    // First check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { id: true, ownerId: true, title: true }
    })

    if (!existingDeal) {
      return Response.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only delete their own deals (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingDeal.ownerId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    await prisma.deal.delete({
      where: { id: dealId }
    })

    return successResponse(
      { message: 'Deal deleted successfully', dealId },
      200
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/deals/[id] - Update specific fields (like stage)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('DEAL_UPDATE')
    const { id: dealId } = await params
    const body = await request.json()

    // First check if deal exists and user has permission
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { id: true, ownerId: true }
    })

    if (!existingDeal) {
      return Response.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permission - users can only update their own deals (except admins/managers)
    if (user.role === 'REP' || user.role === 'READ_ONLY') {
      if (existingDeal.ownerId !== user.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    // Allow updating specific fields
    const allowedUpdates: Record<string, any> = {}
    
    if (body.stage !== undefined) {
      allowedUpdates.stage = body.stage
    }
    if (body.probability !== undefined) {
      allowedUpdates.probability = body.probability
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: allowedUpdates,
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

    return successResponse(updatedDeal)
  } catch (error) {
    return handleApiError(error)
  }
}