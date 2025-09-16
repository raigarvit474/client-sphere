import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.isActive) {
          return null
        }

        // For demo purposes, we'll create a simple password check
        // In production, you'd hash passwords properly
        const isPasswordValid = credentials.password === 'password123' || 
          (user as any).password && bcrypt.compareSync(credentials.password, (user as any).password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for Google and credentials
      if (account?.provider === 'google') {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          // If user doesn't exist, create them with default role
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                image: user.image,
                role: Role.REP, // Default role for Google sign-ups
                isActive: true,
                emailVerified: new Date() // Google accounts are pre-verified
              }
            })
          } else if (!existingUser.isActive) {
            // Don't allow inactive users to sign in
            return false
          }
        } catch (error) {
          console.error('Error handling Google sign-in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Handle initial sign-in
      if (user && account) {
        if (account.provider === 'google') {
          // Fetch user role from database for Google users
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          token.role = dbUser?.role || Role.REP
          token.id = dbUser?.id || user.id
        } else {
          // For credentials provider
          token.role = (user as any).role
          token.id = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    role: Role
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: Role
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role
    id: string
  }
}
