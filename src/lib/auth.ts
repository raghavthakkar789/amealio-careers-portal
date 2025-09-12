import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { validateDemoAccount } from '@/lib/demo-accounts'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        try {
          // Try database authentication first
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (user && user?.password) {
            const isCorrectPassword = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (isCorrectPassword) {
              return {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
              }
            }
          }
        } catch (error) {
          console.log('Database not available, using demo accounts')
        }

        // Fallback to demo accounts if database is not available
        const demoUser = validateDemoAccount(credentials.email, credentials.password)
        if (demoUser) {
          return demoUser
        }

        throw new Error('Invalid credentials')
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
