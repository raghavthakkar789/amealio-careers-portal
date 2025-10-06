'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  isRetrying: boolean
}

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, isRetrying: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const isChunkLoadError = 
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk') ||
      error.message.includes('timeout')

    return {
      hasError: isChunkLoadError,
      error: isChunkLoadError ? error : undefined,
      isRetrying: false
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChunkLoadError caught:', error, errorInfo)
    
    // Log the error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Info:', errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ isRetrying: true })
    
    // Clear any cached chunks
    if (typeof window !== 'undefined') {
      // Clear service worker cache if available
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister()
          })
        })
      }

      // Clear browser cache
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName)
          })
        })
      }

      // Force reload after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      // Clear all caches and force reload
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName)
          })
        })
      }
      
      // Force hard refresh
      window.location.href = window.location.href
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-850 p-4">
          <div className="max-w-md w-full bg-bg-800 rounded-xl border border-border p-8 text-center">
            <div className="flex justify-center mb-6">
              <ExclamationTriangleIcon className="w-16 h-16 text-amber-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Loading Error
            </h1>
            
            <p className="text-text-secondary mb-6">
              We encountered an issue loading the application. This is usually caused by a cached file that needs to be refreshed.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {this.state.isRetrying ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Retry Loading
                  </>
                )}
              </Button>
              
              <Button
                onClick={this.handleHardRefresh}
                className="w-full bg-bg-700 hover:bg-bg-600 text-text-primary py-3 px-6 rounded-lg font-medium transition-colors border border-border"
              >
                Hard Refresh
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-bg-900 rounded-lg border border-border">
              <p className="text-sm text-text-mid mb-2">
                <strong>What happened?</strong>
              </p>
              <p className="text-sm text-text-mid">
                The application failed to load a required file. This can happen when the application is updated while you have it open.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-text-mid cursor-pointer hover:text-text-primary">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-text-mid bg-bg-900 p-2 rounded border overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
