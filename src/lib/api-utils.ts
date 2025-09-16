import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'A record with this information already exists' },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: 'Invalid reference to related record' },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          { error: 'Database operation failed' },
          { status: 500 }
        )
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function parseQueryParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    status: searchParams.get('status') || undefined,
    owner: searchParams.get('owner') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined
  }
}