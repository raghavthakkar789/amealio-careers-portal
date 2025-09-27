// Real-time application updates hook
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { applicationStatusService, ApplicationStatusUpdate } from '@/lib/application-status-service'

interface UseApplicationUpdatesOptions {
  applicationId?: string
  onStatusUpdate?: (applicationId: string, update: ApplicationStatusUpdate) => void
}

export function useApplicationUpdates(options: UseApplicationUpdatesOptions = {}) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const handleStatusUpdate = useCallback((applicationId: string, update: ApplicationStatusUpdate) => {
    setLastUpdate(new Date())
    
    if (options.onStatusUpdate) {
      options.onStatusUpdate(applicationId, update)
    }

    // Show browser notification if user is not on the page
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const statusDisplay = applicationStatusService.getStatusDisplay(update.newStatus)
      new Notification(`Application Status Updated`, {
        body: `Your application status has been updated to ${statusDisplay.label}`,
        icon: '/favicon.ico'
      })
    }
  }, [options])

  useEffect(() => {
    if (!session) return

    // Subscribe to application status updates
    const unsubscribe = applicationStatusService.subscribe(handleStatusUpdate)
    setIsConnected(true)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [session, handleStatusUpdate])

  return {
    isConnected,
    lastUpdate
  }
}

// Hook for polling application updates (fallback for real-time)
export function useApplicationPolling(applicationId?: string, interval: number = 30000) {
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const checkForUpdates = useCallback(async () => {
    if (!applicationId) return

    try {
      const response = await fetch(`/api/applications/${applicationId}`)
      if (response.ok) {
        setLastChecked(new Date())
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, [applicationId])

  useEffect(() => {
    if (!applicationId) return

    setIsPolling(true)
    const intervalId = setInterval(checkForUpdates, interval)

    return () => {
      clearInterval(intervalId)
      setIsPolling(false)
    }
  }, [applicationId, interval, checkForUpdates])

  return {
    isPolling,
    lastChecked,
    checkForUpdates
  }
}
