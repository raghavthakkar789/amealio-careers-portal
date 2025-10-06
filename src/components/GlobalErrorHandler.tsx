'use client'

import { useEffect } from 'react'

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      
      // Check for specific error types
      if (event.error?.message?.includes("Cannot read properties of undefined (reading 'call')")) {
        console.error('Detected undefined call error - attempting recovery')
        
        // Show user-friendly message
        const shouldReload = window.confirm(
          'A module loading error occurred. Would you like to reload the page to fix this issue?'
        )
        
        if (shouldReload) {
          window.location.reload()
        }
      }
    }

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Check for specific error types
      if (event.reason?.message?.includes("Cannot read properties of undefined (reading 'call')")) {
        console.error('Detected undefined call error in promise rejection - attempting recovery')
        
        // Prevent the default browser behavior
        event.preventDefault()
        
        // Show user-friendly message
        const shouldReload = window.confirm(
          'A module loading error occurred. Would you like to reload the page to fix this issue?'
        )
        
        if (shouldReload) {
          window.location.reload()
        }
      }
    }

    // Add event listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
