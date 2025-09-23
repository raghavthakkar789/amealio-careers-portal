import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent MetaMask connection attempts
              if (typeof window !== 'undefined') {
                // Block MetaMask immediately
                if (window.ethereum) {
                  // Override the ethereum object to prevent all connection attempts
                  Object.defineProperty(window, 'ethereum', {
                    value: {
                      ...window.ethereum,
                      request: function(args) {
                        console.warn('MetaMask connection blocked for this application');
                        return Promise.reject(new Error('MetaMask connection not supported in this application'));
                      },
                      isMetaMask: false,
                      isConnected: function() { return false; },
                      on: function() { return this; },
                      removeListener: function() { return this; },
                      removeAllListeners: function() { return this; }
                    },
                    writable: false,
                    configurable: false
                  });
                }
                
                // Also block any future ethereum object creation
                window.addEventListener('load', function() {
                  if (window.ethereum) {
                    window.ethereum.request = function(args) {
                      console.warn('MetaMask connection blocked for this application');
                      return Promise.reject(new Error('MetaMask connection not supported in this application'));
                    };
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
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
      </body>
    </html>
  )
}
