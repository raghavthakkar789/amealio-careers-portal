import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
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

        // Simple hardcoded demo accounts
        const demoAccounts = [
          { email: 'admin@amealio.com', password: 'admin123', role: 'ADMIN', name: 'Admin User' },
          { email: 'hr@amealio.com', password: 'hr123', role: 'HR', name: 'HR Manager' },
          { email: 'user@amealio.com', password: 'user123', role: 'APPLICANT', name: 'John Doe' }
        ]

        const account = demoAccounts.find(acc => 
          acc.email === credentials.email && acc.password === credentials.password
        )

        if (account) {
          return {
            id: account.email,
            email: account.email,
            name: account.name,
            role: account.role,
          }
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
  },
  secret: 'fallback-secret-for-development',
}
