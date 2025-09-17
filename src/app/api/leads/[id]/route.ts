import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, errorResponse } from '@/lib/api-utils'
import { updateLeadSchema } from '@/lib/validations'
import { requirePermission, canAccessResource } from '@/lib/auth-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  try {
    const user = await requirePermission('LEAD_READ')
    const { id } = resolvedParams

    const lead = await prisma.lead.findUnique({
      where: { id },
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
        activities: {
          include: {
            assignee: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!lead) {
      return errorResponse('Lead not found', 404)
    }

    if (!canAccessResource(user.role, user.id, lead.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    return successResponse(lead)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('LEAD_UPDATE')
    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const validatedData = updateLeadSchema.parse(body)

    // Check if lead exists and user has access
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!existingLead) {
      return errorResponse('Lead not found', 404)
    }

    if (!canAccessResource(user.role, user.id, existingLead.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    const lead = await prisma.lead.update({
      where: { id },
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
        contactId: validatedData.contactId,
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

    return successResponse(lead)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('LEAD_DELETE')
    const resolvedParams = await params
    const { id } = resolvedParams

    // Check if lead exists and user has access
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!existingLead) {
      return errorResponse('Lead not found', 404)
    }

    if (!canAccessResource(user.role, user.id, existingLead.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    await prisma.lead.delete({
      where: { id }
    })

    return successResponse({ message: 'Lead deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}