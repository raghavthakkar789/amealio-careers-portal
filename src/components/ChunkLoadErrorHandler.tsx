'use client'

import { useEffect } from 'react'

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors globally
    const handleChunkLoadError = (event: ErrorEvent) => {
      const error = event.error
      
      // Check if it's a chunk loading error
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk') ||
        error?.message?.includes('timeout')
      ) {
        console.error('ChunkLoadError detected:', error)
        
        // Show user-friendly error message
        const shouldReload = window.confirm(
          'The application needs to reload to load the latest changes. Would you like to reload now?'
        )
        
        if (shouldReload) {
          // Clear caches and reload
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                caches.delete(cacheName)
              })
            })
          }
          
          window.location.reload()
        }
      }
    }

    // Handle unhandled promise rejections (common with chunk loading errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      
      if (
        reason?.name === 'ChunkLoadError' ||
        reason?.message?.includes('Loading chunk') ||
        reason?.message?.includes('Loading CSS chunk') ||
        reason?.message?.includes('timeout')
      ) {
        console.error('ChunkLoadError promise rejection:', reason)
        
        // Prevent the default browser behavior
        event.preventDefault()
        
        // Show user-friendly error message
        const shouldReload = window.confirm(
          'The application needs to reload to load the latest changes. Would you like to reload now?'
        )
        
        if (shouldReload) {
          // Clear caches and reload
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                caches.delete(cacheName)
              })
            })
          }
          
          window.location.reload()
        }
      }
    }

    // Add event listeners
    window.addEventListener('error', handleChunkLoadError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkLoadError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
