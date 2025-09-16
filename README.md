# NextJS CRM Application

A comprehensive Customer Relationship Management (CRM) web application built with Next.js 15, TypeScript, TailwindCSS, shadcn/ui, PostgreSQL, and NextAuth.

## ✨ Features

### 🔐 Authentication & Authorization
- NextAuth integration with database adapter
- Role-based access control (RBAC)
- Four user roles: Admin, Manager, Sales Rep, Read-Only
- Secure middleware protection

### 👥 User Management
- User creation and management
- Role assignment and permissions
- Active/inactive user status

### 📞 Contact Management
- Complete contact profiles with personal and company information
- Contact ownership and assignment
- Notes and tags for organization

### 🎯 Lead Management
- Lead capture and tracking
- Lead status progression (New → Contacted → Qualified → etc.)
- Lead-to-contact conversion
- Lead value tracking

### 💼 Deal Management
- Deal pipeline with customizable stages
- Probability and value tracking
- Expected close dates
- Deal-to-lead relationships

### 📅 Activity Management
- Task, call, meeting, email, and note tracking
- Activity assignment and scheduling
- Priority levels
- Activity completion tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui with Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (Frontend) + Railway (Database)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy `.env.example` to `.env.local` and update the values:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/nextjs_crm"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # App Configuration
   APP_URL="http://localhost:3000"
   ```

4. **Database Setup**
   
   Generate Prisma client:
   ```bash
   npm run db:generate
   ```
   
   Run database migrations:
   ```bash
   npm run db:migrate
   ```
   
   Seed the database with sample data:
   ```bash
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

After running the seed script, you can login with:

- **Admin**: admin@crm.com / password123
- **Manager**: manager@crm.com / password123
- **Sales Rep 1**: rep1@crm.com / password123
- **Sales Rep 2**: rep2@crm.com / password123

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Environment Variables for Vercel**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   APP_URL=https://your-app.vercel.app
   ```

### Railway Database

1. **Create PostgreSQL Database**
   - Sign up at [Railway](https://railway.app)
   - Create new project
   - Add PostgreSQL service
   - Copy connection string

2. **Run Migrations on Production**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 🔒 Security Features

- **Authentication**: Secure login with NextAuth
- **Authorization**: Role-based access control
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CSRF Protection**: Built-in Next.js protections
- **Environment Variables**: Sensitive data in environment files

---

**Happy CRM-ing! 🎉**
