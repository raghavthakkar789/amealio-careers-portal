// Application Status Management Service
import { prisma } from '@/lib/prisma'
import { ApplicationStatus, UserRole } from '@prisma/client'

export interface StatusTransition {
  from: ApplicationStatus | null
  to: ApplicationStatus
  action: string
  allowedRoles: UserRole[]
  requiresConfirmation: boolean
  confirmationMessage?: string
  description: string
}

export interface ApplicationStatusUpdate {
  applicationId: string
  newStatus: ApplicationStatus
  action: string
  performedBy: string
  performedByName: string
  performedByRole: UserRole
  notes?: string
}

export interface ApplicationWithHistory {
  id: string
  status: ApplicationStatus
  jobTitle: string
  expectedSalary?: string
  submittedAt: Date
  updatedAt: Date
  applicant: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  job: {
    id: string
    title: string
    department: {
      name: string
    }
  }
  history: Array<{
    id: string
    fromStatus: ApplicationStatus | null
    toStatus: ApplicationStatus
    action: string
    performedByName: string
    performedByRole: UserRole
    notes: string | null
    createdAt: Date
  }>
}

class ApplicationStatusService {
  private statusTransitions: Map<ApplicationStatus, StatusTransition[]> = new Map()
  private listeners: Set<(applicationId: string, update: ApplicationStatusUpdate) => void> = new Set()

  constructor() {
    this.initializeStatusTransitions()
  }

  private initializeStatusTransitions() {
    // Define all possible status transitions
    const transitions: StatusTransition[] = [
      {
        from: 'PENDING',
        to: 'UNDER_REVIEW',
        action: 'START_REVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: false,
        description: 'Start reviewing the application'
      },
      {
        from: 'PENDING',
        to: 'REJECTED',
        action: 'REJECT_APPLICATION',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this application?',
        description: 'Reject the application'
      },
      {
        from: 'UNDER_REVIEW',
        to: 'INTERVIEW_SCHEDULED',
        action: 'SCHEDULE_INTERVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: false,
        description: 'Schedule an interview with the candidate'
      },
      {
        from: 'UNDER_REVIEW',
        to: 'REJECTED',
        action: 'REJECT_AFTER_REVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this application after review?',
        description: 'Reject the application after review'
      },
      {
        from: 'INTERVIEW_SCHEDULED',
        to: 'INTERVIEW_COMPLETED',
        action: 'COMPLETE_INTERVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: false,
        description: 'Mark interview as completed'
      },
      {
        from: 'INTERVIEW_SCHEDULED',
        to: 'REJECTED',
        action: 'REJECT_AFTER_INTERVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this candidate after the interview?',
        description: 'Reject the candidate after interview'
      },
      {
        from: 'INTERVIEW_COMPLETED',
        to: 'ACCEPTED',
        action: 'ACCEPT_CANDIDATE',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to accept this candidate?',
        description: 'Accept the candidate'
      },
      {
        from: 'INTERVIEW_COMPLETED',
        to: 'REJECTED',
        action: 'REJECT_AFTER_INTERVIEW_COMPLETION',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this candidate after interview completion?',
        description: 'Reject the candidate after interview completion'
      },
      {
        from: 'ACCEPTED',
        to: 'HIRED',
        action: 'HIRE_CANDIDATE',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to hire this candidate?',
        description: 'Hire the candidate'
      }
    ]

    // Group transitions by from status
    transitions.forEach(transition => {
      const fromStatus = transition.from
      if (fromStatus && !this.statusTransitions.has(fromStatus)) {
        this.statusTransitions.set(fromStatus, [])
      }
      if (fromStatus) {
        this.statusTransitions.get(fromStatus)!.push(transition)
      }
    })
  }

  // Get available transitions for a given status and user role
  getAvailableTransitions(currentStatus: ApplicationStatus, userRole: UserRole): StatusTransition[] {
    const transitions = this.statusTransitions.get(currentStatus) || []
    return transitions.filter(transition => 
      transition.allowedRoles.includes(userRole)
    )
  }

  // Update application status with full audit trail
  async updateApplicationStatus(update: ApplicationStatusUpdate): Promise<ApplicationWithHistory> {
    const { applicationId, newStatus, action, performedBy, performedByName, performedByRole, notes } = update

    // Get current application
    const currentApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!currentApplication) {
      throw new Error('Application not found')
    }

    // Check if status is actually changing
    if (currentApplication.status === newStatus) {
      throw new Error(`Application is already in ${newStatus} status`)
    }

    // Validate transition
    const availableTransitions = this.getAvailableTransitions(currentApplication.status, performedByRole)
    const validTransition = availableTransitions.find(t => t.to === newStatus && t.action === action)
    
    if (!validTransition) {
      throw new Error(`Invalid status transition from ${currentApplication.status} to ${newStatus}`)
    }

    // Update application status and create history record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.application.update({
        where: { id: applicationId },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        },
        include: {
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              department: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      // Create history record
      await tx.applicationHistory.create({
        data: {
          applicationId,
          fromStatus: currentApplication.status,
          toStatus: newStatus,
          action,
          performedBy,
          performedByName,
          performedByRole,
          notes
        }
      })

      // Create notification for the applicant
      await tx.notification.create({
        data: {
          title: this.getNotificationTitle(newStatus, action),
          message: this.getNotificationMessage(newStatus, action, updatedApplication.jobTitle),
          type: 'in-app',
          userId: updatedApplication.applicantId,
          applicationId
        }
      })

      return updatedApplication
    })

    // Get updated application with history
    const applicationWithHistory = await this.getApplicationWithHistory(applicationId)

    // Notify all listeners
    this.notifyListeners(applicationId, update)

    return applicationWithHistory
  }

  // Get application with complete history
  async getApplicationWithHistory(applicationId: string): Promise<ApplicationWithHistory> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        jobTitle: true,
        expectedSalary: true,
        submittedAt: true,
        updatedAt: true,
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        },
        history: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            action: true,
            performedByName: true,
            performedByRole: true,
            notes: true,
            createdAt: true
          }
        }
      }
    })

    if (!application) {
      throw new Error('Application not found')
    }

    return application as ApplicationWithHistory
  }

  // Get all applications with history for a user
  async getApplicationsWithHistory(userRole: UserRole, userId?: string): Promise<ApplicationWithHistory[]> {
    try {
      let whereClause: any = {}

      if (userRole === 'ADMIN') {
        // Admin can see all applications
        whereClause = {}
      } else if (userRole === 'HR') {
        // HR can see applications for jobs they created
        whereClause = {
          job: {
            createdById: userId
          }
        }
      } else if (userRole === 'APPLICANT') {
        // Applicants can only see their own applications
        whereClause = {
          applicantId: userId
        }
      }

    const applications = await prisma.application.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        jobTitle: true,
        expectedSalary: true,
        submittedAt: true,
        updatedAt: true,
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true
              }
            }
          }
        },
        history: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            action: true,
            performedByName: true,
            performedByRole: true,
            notes: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

      return applications as ApplicationWithHistory[]
    } catch (error) {
      console.error('Error in getApplicationsWithHistory:', error)
      throw error
    }
  }

  // Get status display information
  getStatusDisplay(status: ApplicationStatus): { color: string; icon: string; label: string } {
    const statusMap = {
      PENDING: { color: 'bg-blue-100 text-blue-800', icon: 'DocumentTextIcon', label: 'Pending' },
      UNDER_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: 'EyeIcon', label: 'Under Review' },
      INTERVIEW_SCHEDULED: { color: 'bg-purple-100 text-purple-800', icon: 'CalendarIcon', label: 'Interview Scheduled' },
      INTERVIEW_COMPLETED: { color: 'bg-indigo-100 text-indigo-800', icon: 'CheckCircleIcon', label: 'Interview Completed' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', icon: 'CheckCircleIcon', label: 'Accepted' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: 'XCircleIcon', label: 'Rejected' },
      HIRED: { color: 'bg-emerald-100 text-emerald-800', icon: 'CheckCircleIcon', label: 'Hired' }
    }

    return statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: 'QuestionMarkCircleIcon', label: 'Unknown' }
  }

  // Get notification title based on status and action
  private getNotificationTitle(status: ApplicationStatus, action: string): string {
    const titleMap: Record<ApplicationStatus, string> = {
      PENDING: 'Application Received',
      UNDER_REVIEW: 'Application Under Review',
      INTERVIEW_SCHEDULED: 'Interview Scheduled',
      INTERVIEW_COMPLETED: 'Interview Completed',
      ACCEPTED: 'Application Accepted',
      REJECTED: 'Application Update',
      HIRED: 'Congratulations! You\'re Hired!'
    }

    return titleMap[status] || 'Application Status Updated'
  }

  // Get notification message based on status and action
  private getNotificationMessage(status: ApplicationStatus, action: string, jobTitle: string): string {
    const messageMap: Record<ApplicationStatus, string> = {
      PENDING: `Your application for ${jobTitle} has been received and is being processed.`,
      UNDER_REVIEW: `Your application for ${jobTitle} is now under review. We'll get back to you soon!`,
      INTERVIEW_SCHEDULED: `Great news! We'd like to schedule an interview for your ${jobTitle} application. Check your email for details.`,
      INTERVIEW_COMPLETED: `Your interview for ${jobTitle} has been completed. We'll review the results and get back to you.`,
      ACCEPTED: `Congratulations! Your application for ${jobTitle} has been accepted. We'll be in touch with next steps.`,
      REJECTED: `Thank you for your interest in ${jobTitle}. Unfortunately, we've decided to move forward with other candidates.`,
      HIRED: `Welcome to the team! You've been hired for the ${jobTitle} position. We're excited to have you on board!`
    }

    return messageMap[status] || `Your application status for ${jobTitle} has been updated.`
  }

  // Subscribe to status changes
  subscribe(listener: (applicationId: string, update: ApplicationStatusUpdate) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners
  private notifyListeners(applicationId: string, update: ApplicationStatusUpdate) {
    this.listeners.forEach(listener => {
      try {
        listener(applicationId, update)
      } catch (error) {
        console.error('Error notifying listener:', error)
      }
    })
  }

  // Get status transition history for an application
  async getApplicationHistory(applicationId: string) {
    return await prisma.applicationHistory.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
      include: {
        performer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })
  }
}

// Export singleton instance
export const applicationStatusService = new ApplicationStatusService()
