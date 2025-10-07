import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  // Ensure consistent formatting between server and client
  const dateObj = new Date(date)
  // Use a consistent format that doesn't depend on locale
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}/${day}/${year}`
}

export function formatDateTime(date: Date | string): string {
  // Ensure consistent formatting between server and client
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  const displayMinutes = minutes.toString().padStart(2, '0')
  return `${month}/${day}/${year} at ${displayHours}:${displayMinutes} ${ampm}`
}

export function formatDateLong(date: Date | string): string {
  // For longer format like "January 15, 2024"
  const dateObj = new Date(date)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const year = dateObj.getFullYear()
  const month = months[dateObj.getMonth()]
  const day = dateObj.getDate()
  return `${month} ${day}, ${year}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateId(): string {
  // Use crypto.randomUUID if available (browser), otherwise fallback to timestamp-based ID
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback for SSR - use timestamp + random to ensure uniqueness
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters and check if exactly 10 digits
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length === 10
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}


export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-pending'
    case 'under_review':
    case 'interview_scheduled':
      return 'status-review'
    case 'accepted':
    case 'hired':
      return 'status-accepted'
    case 'rejected':
      return 'status-rejected'
    default:
      return 'status-pending'
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
