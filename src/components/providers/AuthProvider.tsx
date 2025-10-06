'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <GlobalErrorHandler />
      {children}
    </SessionProvider>
  )
}
