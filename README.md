# Client Sphere

A modern Customer Relationship Management (CRM) system built with Next.js 15, React 19, TypeScript, Prisma, and Tailwind CSS.

## 🌟 Features

### Core CRM Functionality
- **Lead Management**: Create, track, and manage leads with detailed information including status, source, scoring, estimated value, expected closing date, notes, and tags
- **Deal Management**: Handle sales pipeline with stages, values, win probability tracking, currency selection, and deal summaries
- **Activity Management**: Schedule and track activities (tasks, calls, meetings, emails) with calendar view, priority levels, due dates, and assignment
- **User Management**: Role-based user management with permissions, active status, and welcome email functionality
- **Reports & Analytics**: Export data in CSV and PDF formats with various report types

### Advanced Features
- **Calendar View**: Interactive calendar for activities with month navigation and activity type indicators
- **Form Validation**: Comprehensive form validation using Zod schemas
- **Responsive Design**: Mobile-first responsive interface that works on all devices
- **Export Functionality**: Multiple export options (CSV, PDF) for reports and data analysis
- **Real-time Updates**: Dynamic state management for seamless user experience

### Technical Features
- **Modern Stack**: Next.js 15 with App Router, React 19, TypeScript
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL/MySQL (prod)
- **Authentication**: NextAuth.js with Google OAuth and credentials support
- **UI Components**: Radix UI with Tailwind CSS and custom components
- **Form Handling**: React Hook Form with Zod validation
- **Code Quality**: ESLint configuration with TypeScript support

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
   cd client-sphere
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

### **Google OAuth Setup (Optional)**

To enable Google authentication:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project or select existing**
3. **Enable Google+ API** (or Google Identity services)
4. **Create OAuth 2.0 credentials:**
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
5. **Copy the Client ID and Client Secret to your `.env.local` file:**
   ```env
   GOOGLE_CLIENT_ID="your-client-id.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```
6. **Restart the development server**

Users can now sign in with Google and will automatically be created with a "REP" role.

### Demo Accounts

After running the seed script, you can login with:

- **Admin**: admin@crm.com / password123
- **Manager**: manager@crm.com / password123
- **Sales Rep 1**: rep1@crm.com / password123
- **Sales Rep 2**: rep2@crm.com / password123

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database

### Testing
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests with coverage

### Deployment
- `npm run deploy:prepare` - Prepare application for deployment
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run build:analyze` - Analyze bundle size
- `npm run clean` - Clean build artifacts

## 🚀 Deployment

This application can be deployed on various platforms:

- **Vercel** (Recommended) - Easy deployment for Next.js apps
- **Netlify** - Alternative static site hosting
- **DigitalOcean App Platform** - Container-based deployment
- **Railway** - Simple database and app hosting
- **Self-hosted** - VPS/Server deployment with Nginx

### Quick Deploy to Vercel

1. **Prepare for deployment**
   ```bash
   npm run deploy:prepare
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   npm run deploy:vercel
   ```

3. **Configure Environment Variables**
   - Add environment variables in Vercel dashboard
   - Set up production database (PostgreSQL recommended)
   - Update NEXTAUTH_URL and APP_URL to your domain

Make sure to set up your production database and update environment variables accordingly.

## 🔒 Security Features

- **Authentication**: Secure login with NextAuth
- **Authorization**: Role-based access control
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CSRF Protection**: Built-in Next.js protections
- **Environment Variables**: Sensitive data in environment files

---

**Happy CRM-ing! 🎉**
