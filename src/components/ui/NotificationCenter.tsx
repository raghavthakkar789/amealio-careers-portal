'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BellIcon, 
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Button } from './Button'
import { LoadingSpinner } from './LoadingSpinner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  application?: {
    id: string
    jobTitle: string
    status: string
  }
  interview?: {
    id: string
    scheduledAt: string
    status: string
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && session) {
      fetchNotifications()
    }
  }, [isOpen, session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setActionLoading(notificationId)
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    setActionLoading(notificationId)
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        )
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getNotificationIcon = (notification: Notification) => {
    if (notification.interview) {
      return <CalendarIcon className="w-5 h-5" />
    }
    if (notification.application) {
      return <DocumentTextIcon className="w-5 h-5" />
    }
    return <BellIcon className="w-5 h-5" />
  }

  const getNotificationColor = (notification: Notification) => {
    if (notification.application) {
      const status = notification.application.status
      if (status === 'HIRED' || status === 'ACCEPTED') {
        return 'text-green-600'
      }
      if (status === 'REJECTED') {
        return 'text-red-600'
      }
      if (status === 'INTERVIEW_SCHEDULED') {
        return 'text-blue-600'
      }
    }
    return 'text-gray-600'
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BellIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="md" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <BellIcon className="w-12 h-12 mb-2" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 mb-2 rounded-lg border ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${getNotificationColor(notification)}`}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="p-1 hover:bg-gray-200 rounded-full"
                              title="Mark as read"
                            >
                              {actionLoading === notification.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <CheckIcon className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            disabled={actionLoading === notification.id}
                            className="p-1 hover:bg-gray-200 rounded-full"
                            title="Delete notification"
                          >
                            <TrashIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
