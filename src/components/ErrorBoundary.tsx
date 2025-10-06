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
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Check for specific error types
    if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
      console.error('Detected undefined call error - this is likely a module loading issue')
    }
    
    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Clear any cached modules
    if (typeof window !== 'undefined') {
      // Force a hard refresh to clear any cached modules
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      const isUndefinedCallError = this.state.error?.message.includes("Cannot read properties of undefined (reading 'call')")
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-850 p-4">
          <div className="max-w-md w-full bg-bg-800 rounded-xl border border-border p-8 text-center">
            <div className="flex justify-center mb-6">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Application Error
            </h1>
            
            <p className="text-text-secondary mb-6">
              {isUndefinedCallError 
                ? "A module loading error occurred. This usually happens when there's a problem with how the application is loading its components."
                : "An unexpected error occurred in the application."
              }
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Reload Application
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-bg-900 rounded-lg border border-border">
              <p className="text-sm text-text-mid mb-2">
                <strong>Error Details:</strong>
              </p>
              <p className="text-sm text-text-mid">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-text-mid cursor-pointer hover:text-text-primary">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-text-mid bg-bg-900 p-2 rounded border overflow-auto max-h-40">
                  {this.state.error?.stack}
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