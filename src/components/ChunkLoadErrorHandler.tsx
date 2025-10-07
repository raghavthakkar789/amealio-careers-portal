'use client'

import { useEffect } from 'react'

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors globally
    const handleChunkLoadError = (event: ErrorEvent) => {
      if (
        event.message?.includes('Loading chunk') ||
        event.message?.includes('Loading CSS chunk') ||
        event.message?.includes('timeout') ||
        event.filename?.includes('chunks') ||
        event.message?.includes('ChunkLoadError')
      ) {
        console.error('Chunk load error detected:', event)
        
        // Show user-friendly message
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #40299B;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">Loading Error</div>
            <div>Retrying to load page...</div>
          </div>
        `
        document.body.appendChild(toast)
        
        // Clear caches and reload
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName)
            })
          })
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    }

    // Handle unhandled promise rejections (common with chunk loading errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('Loading CSS chunk') ||
        event.reason?.message?.includes('timeout') ||
        event.reason?.message?.includes('ChunkLoadError')
      ) {
        console.error('Chunk load promise rejection:', event.reason)
        
        // Show user-friendly message
        const toast = document.createElement('div')
        toast.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #40299B;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">Loading Error</div>
            <div>Retrying to load page...</div>
          </div>
        `
        document.body.appendChild(toast)
        
        // Clear caches and reload
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName)
            })
          })
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
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