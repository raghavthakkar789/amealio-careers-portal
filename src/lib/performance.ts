/**
 * Performance optimization utilities
 * Handles caching, memory management, and performance monitoring
 */

// Memory management utilities
export class MemoryManager {
  private static cache = new Map<string, any>()
  private static maxCacheSize = 100
  private static cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Initialize memory management
   */
  static initialize() {
    if (typeof window !== 'undefined') {
      // Start cleanup interval for client-side
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 30000) // Clean every 30 seconds

      // Listen for memory pressure events
      if ('memory' in performance) {
        this.monitorMemoryUsage()
      }
    }
  }

  /**
   * Clean up memory and cache
   */
  static cleanup() {
    // Clear old cache entries
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
      const toDelete = entries.slice(0, entries.length - this.maxCacheSize)
      toDelete.forEach(([key]) => this.cache.delete(key))
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc()
    }
  }

  /**
   * Monitor memory usage
   */
  private static monitorMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1048576
      const totalMB = memory.totalJSHeapSize / 1048576
      
      // If memory usage is high, trigger cleanup
      if (usedMB / totalMB > 0.8) {
        this.cleanup()
      }
    }
  }

  /**
   * Destroy memory manager
   */
  static destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Cache utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Set cache entry
   */
  static set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Get cache entry
   */
  static get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Clear cache
   */
  static clear() {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  static clearExpired() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Record<string, number[]> = {}

  /**
   * Start performance measurement
   */
  static startMeasure(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  /**
   * Record performance metric
   */
  static recordMetric(name: string, value: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = []
    }
    this.metrics[name].push(value)

    // Keep only last 100 measurements
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100)
    }
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [name, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        }
      }
    }
    
    return result
  }

  /**
   * Clear metrics
   */
  static clearMetrics() {
    this.metrics = {}
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading utility
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Image optimization utility
export function optimizeImage(src: string, width?: number, height?: number, quality: number = 75): string {
  if (typeof window === 'undefined') return src
  
  // For Next.js Image component, return the src as-is
  // Next.js will handle optimization automatically
  return src
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src) {
        // This is a simplified check - in reality you'd need to fetch the actual file size
        console.log(`Script: ${src}`)
      }
    })
    
    console.log(`Total scripts: ${scripts.length}`)
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  if (typeof window !== 'undefined') {
    MemoryManager.initialize()
    
    // Clear cache on page unload
    window.addEventListener('beforeunload', () => {
      MemoryManager.cleanup()
      CacheManager.clear()
    })
    
    // Monitor performance
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          PerformanceMonitor.recordMetric(entry.name, entry.duration)
        }
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }
}

// Export React import for lazy loading
import React from 'react'
