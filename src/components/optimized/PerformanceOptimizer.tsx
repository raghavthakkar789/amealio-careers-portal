'use client'

import { useEffect } from 'react'
import { initializePerformanceOptimizations, MemoryManager, CacheManager, PerformanceMonitor } from '@/lib/performance'

/**
 * PerformanceOptimizer component
 * Initializes all performance optimizations on the client side
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations()

    // Set up cleanup on page unload
    const handleBeforeUnload = () => {
      MemoryManager.cleanup()
      CacheManager.clearExpired()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, clean up memory
        MemoryManager.cleanup()
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      MemoryManager.destroy()
    }
  }, [])

  // This component doesn't render anything
  return null
}

/**
 * Performance monitoring component for development
 */
export function PerformanceMonitorComponent() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logMetrics = () => {
        const metrics = PerformanceMonitor.getMetrics()
        console.group('🚀 Performance Metrics')
        Object.entries(metrics).forEach(([name, data]) => {
          console.log(`${name}:`, {
            average: `${data.avg.toFixed(2)}ms`,
            min: `${data.min.toFixed(2)}ms`,
            max: `${data.max.toFixed(2)}ms`,
            count: data.count
          })
        })
        console.groupEnd()
      }

      // Log metrics every 30 seconds in development
      const interval = setInterval(logMetrics, 30000)

      return () => clearInterval(interval)
    }
  }, [])

  return null
}
