import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, parseQueryParams } from '@/lib/api-utils'
import { createUserSchema } from '@/lib/validations'
import { requirePermission } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('USER_READ')
    const params = parseQueryParams(request)
    
    const { page, limit, search, sortBy, sortOrder } = params
    const role = (params as any).role // Extract role separately
    const skip = (page - 1) * limit

    console.log('Users API - User:', { id: user.id, role: user.role, email: user.email })
    console.log('Users API - Query params:', params)

    const where: Record<string, any> = {}
    
    console.log('Users API - Where clause:', where)

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
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
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])
    
    console.log('Users API - Query results:', { 
      totalFound: total, 
      usersReturned: users.length,
      userIds: users.map(u => ({ id: u.id, email: u.email, role: u.role })) 
    })

    return successResponse({
      users,
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
    const user = await requirePermission('USER_CREATE')
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    console.log('Users API - Creating user:', { email: validatedData.email, role: validatedData.role })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      console.log('Users API - User already exists:', { email: validatedData.email })
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        isActive: validatedData.isActive ?? true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('Users API - User created successfully:', { id: newUser.id, email: newUser.email })
    return successResponse(newUser, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
