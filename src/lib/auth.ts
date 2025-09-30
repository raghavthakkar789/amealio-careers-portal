import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check database for user
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email as string,
              // isActive: true // Commented out account verification requirement
            }
          })
          
          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)
          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email)
            return null
          }
          
          console.log('Login successful for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            linkedinProfile: user.linkedinProfile || undefined,
          }
        } catch (error) {
          console.error('Login error:', error)
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string
        token.id = user.id as string
        if (user.linkedinProfile) {
          token.linkedinProfile = user.linkedinProfile
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.linkedinProfile = token.linkedinProfile
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
})
