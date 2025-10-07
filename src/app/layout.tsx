import type { Metadata } from 'next'
import { Mulish } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ChunkLoadErrorBoundary } from '@/components/ChunkLoadErrorBoundary'
import { ChunkLoadErrorHandler } from '@/components/ChunkLoadErrorHandler'

const mulish = Mulish({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'amealio Careers Portal',
  description: 'Join the amealio team and build the future with us',
  keywords: 'careers, jobs, employment, amealio, hiring',
  authors: [{ name: 'amealio Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';" />
      </head>
      <body className={mulish.className} suppressHydrationWarning={true}>
        <ChunkLoadErrorHandler />
        <ChunkLoadErrorBoundary>
          <ErrorBoundary>
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#FFFFFF',
                    color: '#1E293B',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                }}
              />
            </AuthProvider>
          </ErrorBoundary>
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  )
}
