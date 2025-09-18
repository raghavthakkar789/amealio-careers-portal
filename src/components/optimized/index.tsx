/**
 * Optimized React components with performance enhancements
 */

import React, { memo, useMemo, useCallback, useEffect, useState } from 'react'
import { CacheManager, PerformanceMonitor, debounce, throttle } from '@/lib/performance'

// Optimized JobCard component with memoization
interface JobCardProps {
  id: string
  title: string
  department: string
  location: string
  remoteWork: boolean
  requiredSkills: string[]
  summary: string
  applicationDeadline: string
  onApply?: (jobId: string) => void
  onViewDetails?: (jobId: string) => void
}

export const OptimizedJobCard = memo<JobCardProps>(({
  id,
  title,
  department,
  location,
  remoteWork,
  requiredSkills,
  summary,
  applicationDeadline,
  onApply,
  onViewDetails
}) => {
  // Memoize expensive calculations
  const isDeadlinePassed = useMemo(() => {
    return new Date(applicationDeadline) < new Date()
  }, [applicationDeadline])

  const skillsToShow = useMemo(() => {
    return requiredSkills.slice(0, 3) // Only show first 3 skills
  }, [requiredSkills])

  // Memoize event handlers
  const handleApply = useCallback(() => {
    if (onApply) {
      onApply(id)
    }
  }, [id, onApply])

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(id)
    }
  }, [id, onViewDetails])

  return (
    <div className="card hover-lift">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-text-high mb-2">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-text-mid mb-2">
              <span>{department}</span>
              <span>•</span>
              <span>{location}</span>
              {remoteWork && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600">Remote</span>
                </>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isDeadlinePassed 
              ? 'bg-error-bg text-error-text' 
              : 'bg-success-bg text-success-text'
          }`}>
            {isDeadlinePassed ? 'Closed' : 'Open'}
          </span>
        </div>

        <p className="text-text-mid mb-4 line-clamp-3">
          {summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skillsToShow.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-bg-850 text-text-mid text-sm rounded-md border border-border hover:border-primary/50"
            >
              {skill}
            </span>
          ))}
          {requiredSkills.length > 3 && (
            <span className="px-3 py-1 bg-bg-850 text-text-mid text-sm rounded-md border border-border">
              +{requiredSkills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleViewDetails}
            className="btn-secondary flex-1"
          >
            View Details
          </button>
          <button
            onClick={handleApply}
            disabled={isDeadlinePassed}
            className="btn-primary flex-1"
          >
            {isDeadlinePassed ? 'Closed' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  )
})

OptimizedJobCard.displayName = 'OptimizedJobCard'

// Optimized SearchInput component with debouncing
interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  delay?: number
}

export const OptimizedSearchInput = memo<SearchInputProps>(({
  placeholder = "Search...",
  onSearch,
  delay = 300
}) => {
  const [query, setQuery] = useState('')

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, delay),
    [onSearch, delay]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 pl-10 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <svg className="w-5 h-5 text-text-mid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  )
})

OptimizedSearchInput.displayName = 'OptimizedSearchInput'

// Optimized Filter component with memoization
interface FilterProps {
  options: Array<{ value: string; label: string; count?: number }>
  selectedValue: string
  onFilterChange: (value: string) => void
  label: string
}

export const OptimizedFilter = memo<FilterProps>(({
  options,
  selectedValue,
  onFilterChange,
  label
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value)
  }, [onFilterChange])

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-text-mid mb-2">
        {label}
      </label>
      <select
        value={selectedValue}
        onChange={handleChange}
        className="p-3 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} {option.count ? `(${option.count})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
})

OptimizedFilter.displayName = 'OptimizedFilter'

// Optimized LoadingSpinner with performance monitoring
interface OptimizedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const OptimizedLoadingSpinner = memo<OptimizedLoadingSpinnerProps>(({
  size = 'md',
  text
}) => {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'lg': return 'w-8 h-8'
      default: return 'w-6 h-6'
    }
  }, [size])

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses} border-2 border-border border-t-primary rounded-full animate-spin`} />
      {text && (
        <p className="mt-2 text-sm text-text-mid">
          {text}
        </p>
      )}
    </div>
  )
})

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner'

// Optimized Button component with throttling
interface OptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const OptimizedButton = memo<OptimizedButtonProps>(({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  // Throttle click events to prevent rapid clicking
  const throttledOnClick = useMemo(
    () => onClick ? throttle(onClick, 1000) : undefined,
    [onClick]
  )

  const baseClasses = useMemo(() => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary'
    }
    return `${variantClasses[variant]} ${className}`
  }, [variant, className])

  return (
    <button
      onClick={throttledOnClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
})

OptimizedButton.displayName = 'OptimizedButton'

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const endMeasure = PerformanceMonitor.startMeasure(`${componentName}-mount`)
    
    return () => {
      endMeasure()
    }
  }, [componentName])

  const recordRender = useCallback(() => {
    PerformanceMonitor.recordMetric(`${componentName}-render`, performance.now())
  }, [componentName])

  return { recordRender }
}

// Cache hook for component data
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cachedData = CacheManager.get(key)
      if (cachedData) {
        setData(cachedData)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await fetcher()
        CacheManager.set(key, result, ttl)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [key, fetcher, ttl])

  return { data, loading, error }
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, itemHeight, containerHeight, scrollTop])

  const totalHeight = items.length * itemHeight
  const offsetY = scrollTop

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}
