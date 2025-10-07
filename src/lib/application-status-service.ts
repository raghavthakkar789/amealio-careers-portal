// Application Status Management Service
import { prisma } from '@/lib/prisma'
import { ApplicationStatus, UserRole, Prisma } from '@prisma/client'
import { emailService } from '@/lib/email-service'

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
    // Define all possible status transitions according to the new comprehensive workflow
    const transitions: StatusTransition[] = [
      // PENDING stage transitions
      {
        from: 'PENDING',
        to: 'UNDER_REVIEW',
        action: 'UNDER_REVIEW',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: false,
        description: 'Move application to under review'
      },
      {
        from: 'PENDING',
        to: 'REJECTED',
        action: 'REJECT',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this application?',
        description: 'Reject the application'
      },
      
      // UNDER_REVIEW stage transitions
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
        action: 'REJECT',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this application after review?',
        description: 'Reject the application after review'
      },
      
      // INTERVIEW_SCHEDULED stage transitions
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
        action: 'REJECT',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this candidate?',
        description: 'Reject the candidate'
      },
      
      // INTERVIEW_COMPLETED stage transitions
      {
        from: 'INTERVIEW_COMPLETED',
        to: 'ACCEPTED',
        action: 'ACCEPT',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: false,
        description: 'Accept the candidate after interview evaluation'
      },
      {
        from: 'INTERVIEW_COMPLETED',
        to: 'REJECTED',
        action: 'REJECT',
        allowedRoles: ['HR', 'ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this candidate after interview?',
        description: 'Reject the candidate after interview'
      },
      
      // ACCEPTED stage transitions (ADMIN ONLY for final decision)
      {
        from: 'ACCEPTED',
        to: 'HIRED',
        action: 'HIRE',
        allowedRoles: ['ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to hire this candidate?',
        description: 'Hire the candidate (Admin final decision)'
      },
      {
        from: 'ACCEPTED',
        to: 'REJECTED',
        action: 'FINAL_REJECT',
        allowedRoles: ['ADMIN'],
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject this candidate at final stage?',
        description: 'Final rejection by Admin'
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

  // Validate if a transition is allowed (prevents stage skipping)
  validateTransition(fromStatus: ApplicationStatus, toStatus: ApplicationStatus, userRole: UserRole, action: string): boolean {
    // Get available transitions for current status and user role
    const availableTransitions = this.getAvailableTransitions(fromStatus, userRole)
    
    // Check if the requested transition exists and matches the action
    const validTransition = availableTransitions.find(t => t.to === toStatus && t.action === action)
    
    if (!validTransition) {
      return false
    }

    // Additional validation: Ensure no stage skipping
    const statusOrder = ['PENDING', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED', 'HIRED']
    const fromIndex = statusOrder.indexOf(fromStatus)
    const toIndex = statusOrder.indexOf(toStatus)
    
    // Allow REJECTED from any stage
    if (toStatus === 'REJECTED') {
      return true
    }
    
    // Prevent skipping stages (except for REJECTED)
    if (fromIndex !== -1 && toIndex !== -1 && toIndex > fromIndex + 1) {
      return false
    }
    
    return true
  }

  // Update application status with full audit trail
  async updateApplicationStatus(update: ApplicationStatusUpdate): Promise<ApplicationWithHistory> {
    const { applicationId, newStatus, action, performedBy, performedByName, performedByRole, notes } = update

    console.log('Starting application status update:', {
      applicationId,
      newStatus,
      action,
      performedBy,
      performedByName,
      performedByRole
    })

    try {
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

      console.log('Current application found:', {
        id: currentApplication.id,
        currentStatus: currentApplication.status,
        applicantId: currentApplication.applicantId,
        jobTitle: currentApplication.jobTitle
      })

      // Check if status is actually changing
      if (currentApplication.status === newStatus) {
        throw new Error(`Application is already in ${newStatus} status`)
      }

      // Validate transition with enhanced checks
      const isValidTransition = this.validateTransition(currentApplication.status, newStatus, performedByRole, action)
      
      if (!isValidTransition) {
        throw new Error(`Invalid status transition from ${currentApplication.status} to ${newStatus} for role ${performedByRole}. This transition is not allowed or violates the stage workflow.`)
      }

      console.log('Transition validation passed, proceeding with update')

      // Prepare update data based on the new status and action
      const updateData: {
        status: string
        updatedAt: Date
        rejectionReason?: string
        rejectedBy?: string
        rejectedAt?: Date
        rejectionStage?: string
        acceptedByHr?: string
        acceptedByAdmin?: string
        finalDecisionBy?: string
        finalDecisionAt?: Date
        finalComments?: string
      } = {
        status: newStatus,
        updatedAt: new Date()
      }

      // Add specific fields based on the action
      if (action === 'REJECT' || action === 'FINAL_REJECT') {
        updateData.rejectionReason = notes || 'No reason provided'
        updateData.rejectedBy = performedBy
        updateData.rejectedAt = new Date()
        updateData.rejectionStage = currentApplication.status
      }

      if (action === 'ACCEPT') {
        if (performedByRole === 'HR') {
          updateData.acceptedByHr = performedBy
        } else if (performedByRole === 'ADMIN') {
          updateData.acceptedByAdmin = performedBy
        }
      }

      if (action === 'HIRE') {
        updateData.finalDecisionBy = performedBy
        updateData.finalDecisionAt = new Date()
        updateData.finalComments = notes
      }

      // Update application status and create history record in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update application status
        const updatedApplication = await tx.application.update({
          where: { id: applicationId },
          data: updateData as Prisma.ApplicationUpdateInput,
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

      console.log('Application status update completed successfully:', {
        applicationId,
        newStatus,
        action
      })

      // Send email notifications based on the action
      try {
        if (action === 'REJECT' || action === 'FINAL_REJECT') {
          // Determine if candidate was interviewed
          const wasInterviewed = currentApplication.status === 'INTERVIEW_SCHEDULED' || 
                                currentApplication.status === 'INTERVIEW_COMPLETED' ||
                                currentApplication.status === 'ACCEPTED'
          
          await emailService.sendRejectionEmail(applicationId, wasInterviewed)
          console.log('Rejection email sent successfully')
        } else if (action === 'HIRE') {
          await emailService.sendHiredEmail(applicationId, performedBy)
          console.log('Hired email sent successfully')
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't throw error - email failure shouldn't block workflow
      }

      // Notify all listeners
      this.notifyListeners(applicationId, update)

      return applicationWithHistory
    } catch (error) {
      console.error('Error in updateApplicationStatus:', {
        applicationId,
        newStatus,
        action,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
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
      let whereClause: {
        job?: {
          createdById: string
        }
        applicantId?: string
      } = {}

      if (userRole === 'ADMIN') {
        // Admin can see all applications
        whereClause = {}
      } else if (userRole === 'HR' && userId) {
        // HR can see applications for jobs they created
        whereClause = {
          job: {
            createdById: userId
          }
        }
      } else if (userRole === 'APPLICANT' && userId) {
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
  getStatusDisplay(status: ApplicationStatus): { color: string; icon: string; label: string; description: string } {
    const statusMap = {
      PENDING: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: 'DocumentTextIcon', 
        label: 'Application Submitted',
        description: 'Your application has been received and is being processed'
      },
      UNDER_REVIEW: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: 'EyeIcon', 
        label: 'Under Review by HR Team',
        description: 'HR team is evaluating your qualifications and experience'
      },
      INTERVIEW_SCHEDULED: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: 'CalendarIcon', 
        label: 'Interview Scheduled',
        description: 'Interview has been scheduled - check your email for details'
      },
      INTERVIEW_COMPLETED: { 
        color: 'bg-indigo-100 text-indigo-800', 
        icon: 'CheckCircleIcon', 
        label: 'Interview Completed - Pending Final Decision',
        description: 'Interview completed, awaiting final decision from management'
      },
      ACCEPTED: { 
        color: 'bg-green-100 text-green-800', 
        icon: 'CheckCircleIcon', 
        label: 'Congratulations! Offer Extended',
        description: 'Your application has been accepted - welcome to the team!'
      },
      REJECTED: { 
        color: 'bg-red-100 text-red-800', 
        icon: 'XCircleIcon', 
        label: 'Application Not Successful',
        description: 'Thank you for your interest, but we have decided to move forward with other candidates'
      },
      HIRED: { 
        color: 'bg-emerald-100 text-emerald-800', 
        icon: 'CheckCircleIcon', 
        label: 'Hired - Welcome to the Team!',
        description: 'Congratulations! You have been hired and onboarding will begin soon'
      }
    }

    return statusMap[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: 'QuestionMarkCircleIcon', 
      label: 'Unknown Status',
      description: 'Status information not available'
    }
  }

  // Get notification title based on status and action
  private getNotificationTitle(status: ApplicationStatus, action: string): string {
    const titleMap: Record<ApplicationStatus, string> = {
      PENDING: 'Application Received',
      UNDER_REVIEW: 'Application Under Review',
      INTERVIEW_SCHEDULED: 'Interview Scheduled',
      INTERVIEW_COMPLETED: 'Interview Completed - Pending Final Decision',
      ACCEPTED: 'Congratulations! Offer Extended',
      REJECTED: 'Application Not Successful',
      HIRED: 'Welcome to the Team!'
    }

    return titleMap[status] || 'Application Status Updated'
  }

  // Get notification message based on status and action
  private getNotificationMessage(status: ApplicationStatus, action: string, jobTitle: string): string {
    const messageMap: Record<ApplicationStatus, string> = {
      PENDING: `Your application for ${jobTitle} has been received and is being processed.`,
      UNDER_REVIEW: `Your application for ${jobTitle} is now under review by our HR team. We&apos;ll get back to you soon!`,
      INTERVIEW_SCHEDULED: `Great news! We'd like to schedule an interview for your ${jobTitle} application. Check your email for details and add it to your calendar.`,
      INTERVIEW_COMPLETED: `Your interview for ${jobTitle} has been completed. We&apos;re now reviewing the results and will make a final decision soon.`,
      ACCEPTED: `Congratulations! Your application for ${jobTitle} has been accepted. We&apos;ll be in touch with next steps and onboarding details.`,
      REJECTED: `Thank you for your interest in ${jobTitle}. Unfortunately, we&apos;ve decided to move forward with other candidates at this time.`,
      HIRED: `Welcome to the team! You&apos;ve been hired for the ${jobTitle} position. We&apos;re excited to have you on board and will begin the onboarding process soon!`
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
