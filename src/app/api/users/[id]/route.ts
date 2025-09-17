import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse } from '@/lib/api-utils'
import { updateUserSchema } from '@/lib/validations'
import { requirePermission } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission('USER_READ')
    const { id: userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedContacts: true,
            ownedLeads: true,
            ownedDeals: true,
            activities: true,
            createdActivities: true
          }
        }
      }
    })

    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permission - only admins and managers can view other users
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      if (user.id !== currentUser.id) {
        return Response.json(
          { success: false, error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission('USER_UPDATE')
    const { id: userId } = await params
    const body = await request.json()

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permission - admins can update anyone, managers can update non-admins, users can update themselves
    const canUpdate = 
      currentUser.role === 'ADMIN' ||
      (currentUser.role === 'MANAGER' && existingUser.role !== 'ADMIN') ||
      (currentUser.id === userId)

    if (!canUpdate) {
      return Response.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Validate the update data
    const validatedData = updateUserSchema.parse(body)

    // Build update data
    const updateData: any = {}
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.email !== undefined) {
      // Check if email is already taken by another user
      if (validatedData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: validatedData.email }
        })
        if (emailExists) {
          return Response.json(
            { success: false, error: 'Email already exists' },
            { status: 400 }
          )
        }
      }
      updateData.email = validatedData.email
    }

    // Only admins can change roles, and only if not updating themselves
    if (validatedData.role !== undefined && currentUser.role === 'ADMIN' && currentUser.id !== userId) {
      updateData.role = validatedData.role
    }

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12)
    }

    if (validatedData.isActive !== undefined && currentUser.role === 'ADMIN') {
      updateData.isActive = validatedData.isActive
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedContacts: true,
            ownedLeads: true,
            ownedDeals: true,
            activities: true,
            createdActivities: true
          }
        }
      }
    })

    return successResponse(updatedUser)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/users/[id] - Update specific fields (like status or role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission('USER_UPDATE')
    const { id: userId } = await params
    const body = await request.json()

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true }
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permission
    const canUpdate = 
      currentUser.role === 'ADMIN' ||
      (currentUser.role === 'MANAGER' && existingUser.role !== 'ADMIN')

    if (!canUpdate) {
      return Response.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Allow updating specific fields
    const allowedUpdates: any = {}
    
    if (body.isActive !== undefined && currentUser.role === 'ADMIN') {
      // Don't allow deactivating yourself
      if (currentUser.id === userId && !body.isActive) {
        return Response.json(
          { success: false, error: 'Cannot deactivate yourself' },
          { status: 400 }
        )
      }
      allowedUpdates.isActive = body.isActive
    }

    if (body.role !== undefined && currentUser.role === 'ADMIN' && currentUser.id !== userId) {
      // Validate role
      if (!Object.values(Role).includes(body.role)) {
        return Response.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        )
      }
      allowedUpdates.role = body.role
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return Response.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedContacts: true,
            ownedLeads: true,
            ownedDeals: true,
            activities: true,
            createdActivities: true
          }
        }
      }
    })

    return successResponse(updatedUser)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission('USER_DELETE')
    const { id: userId } = await params

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        role: true, 
        email: true, 
        name: true,
        _count: {
          select: {
            ownedContacts: true,
            ownedLeads: true,
            ownedDeals: true,
            activities: true,
            createdActivities: true
          }
        }
      }
    })

    if (!existingUser) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permission - only admins can delete users
    if (currentUser.role !== 'ADMIN') {
      return Response.json(
        { success: false, error: 'Only administrators can delete users' },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (currentUser.id === userId) {
      return Response.json(
        { success: false, error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Check if user has data that would prevent deletion
    const hasData = 
      existingUser._count.ownedContacts > 0 ||
      existingUser._count.ownedLeads > 0 ||
      existingUser._count.ownedDeals > 0 ||
      existingUser._count.activities > 0 ||
      existingUser._count.createdActivities > 0

    if (hasData) {
      return Response.json(
        { 
          success: false, 
          error: 'Cannot delete user with associated data. Please reassign or delete their data first.',
          details: existingUser._count
        },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return successResponse(
      { message: 'User deleted successfully', userId },
      200
    )
  } catch (error) {
    return handleApiError(error)
  }
}