import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, errorResponse } from '@/lib/api-utils'
import { updateContactSchema } from '@/lib/validations'
import { requirePermission, canAccessResource } from '@/lib/auth-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params
  try {
    const user = await requirePermission('CONTACT_READ')
    const { id } = resolvedParams

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        leads: {
          include: {
            owner: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        deals: {
          include: {
            owner: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
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

    if (!contact) {
      return errorResponse('Contact not found', 404)
    }

    if (!canAccessResource(user.role, user.id, contact.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    return successResponse(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('CONTACT_UPDATE')
    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const validatedData = updateContactSchema.parse(body)

    // Check if contact exists and user has access
    const existingContact = await prisma.contact.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!existingContact) {
      return errorResponse('Contact not found', 404)
    }

    if (!canAccessResource(user.role, user.id, existingContact.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return successResponse(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePermission('CONTACT_DELETE')
    const resolvedParams = await params
    const { id } = resolvedParams

    // Check if contact exists and user has access
    const existingContact = await prisma.contact.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!existingContact) {
      return errorResponse('Contact not found', 404)
    }

    if (!canAccessResource(user.role, user.id, existingContact.ownerId)) {
      return errorResponse('Access denied', 403)
    }

    await prisma.contact.delete({
      where: { id }
    })

    return successResponse({ message: 'Contact deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}