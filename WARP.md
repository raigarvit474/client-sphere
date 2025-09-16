# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup & Database
```powershell
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (destructive)
npm run db:reset
```

### Development
```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run single test file
npm run test -- auth-utils.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="hasPermission"
```

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and TypeScript
- **Prisma ORM** with PostgreSQL database
- **NextAuth.js** for authentication with database adapter
- **shadcn/ui** components built on Radix UI
- **Zod** for input validation
- **Jest** with React Testing Library for testing

### Database Schema
The application uses a comprehensive CRM schema with the following entities:
- **Users**: Role-based system (ADMIN, MANAGER, REP, READ_ONLY)
- **Contacts**: Customer profiles with company information
- **Leads**: Sales prospects with status tracking
- **Deals**: Sales opportunities with pipeline stages
- **Activities**: Tasks, calls, meetings, emails, and notes

### Authentication & Authorization
- **Session Strategy**: JWT-based sessions via NextAuth
- **Role Hierarchy**: ADMIN > MANAGER > REP > READ_ONLY
- **Permission System**: Fine-grained permissions per role (e.g., USER_CREATE, CONTACT_READ)
- **Data Access**: Role-based filtering ensures users only see appropriate data
- **Middleware Protection**: Routes are protected via `src/middleware.ts`

### Key Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints with validation
│   ├── dashboard/         # Protected dashboard pages
│   └── contacts/          # Contact management pages
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   └── providers/        # React context providers
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── auth-utils.ts     # Permission & access control utilities
│   ├── prisma.ts         # Database client
│   ├── validations.ts    # Zod schemas for all entities
│   ├── api-utils.ts      # API response helpers
│   └── __tests__/        # Unit tests
└── middleware.ts         # Route protection & role checks
```

### API Design Patterns
- **RESTful Routes**: Standard CRUD operations via App Router API routes
- **Validation**: All inputs validated with Zod schemas before database operations
- **Error Handling**: Consistent error responses via `handleApiError` utility
- **Data Access**: Role-based filtering using `getAccessibleUserIds` function
- **Response Format**: Standardized JSON responses via `successResponse` utility

### Permission System Details
Each role has specific permissions:
- **ADMIN**: Full system access including user management
- **MANAGER**: Can access all CRM data and manage team resources
- **REP**: Can only access their own assigned contacts, leads, deals
- **READ_ONLY**: Read-only access to assigned data

Data access is controlled by:
1. Middleware checking route permissions
2. API endpoints filtering data by `getAccessibleUserIds`
3. Permission checks via `requirePermission` function

### Testing Architecture
- **Unit Tests**: Focus on utility functions and validation logic
- **Test Location**: Co-located in `__tests__` directories
- **Test Utilities**: Custom helpers for auth and validation testing
- **Mocking**: Database operations mocked for unit tests

### Environment Requirements
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nextjs_crm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
APP_URL="http://localhost:3000"
```

### Demo Accounts (after seeding)
- **Admin**: admin@crm.com / password123
- **Manager**: manager@crm.com / password123
- **Sales Rep**: rep1@crm.com / password123

## Development Guidelines

### Adding New Features
1. Create Prisma schema changes and run migrations
2. Update Zod validation schemas in `lib/validations.ts`
3. Add permission constants to `lib/auth-utils.ts`
4. Implement API routes with proper validation and access control
5. Write unit tests for new utilities and validation logic
6. Update TypeScript types as needed

### Database Changes
Always use Prisma migrations for schema changes:
```powershell
# Create migration after schema.prisma changes
npm run db:migrate

# Reset if needed during development
npm run db:reset
```

### Role-Based Development
When adding features that depend on user roles:
1. Check `hasPermission` function for existing permission patterns
2. Use `requirePermission` in API routes
3. Filter data with `getAccessibleUserIds` for proper data access
4. Test all role scenarios in unit tests

### Common Debugging
- Use `npm run db:studio` to inspect database state
- Check middleware logs for authentication issues
- Verify Zod schema validation errors in API responses
- Test role permissions with different demo accounts