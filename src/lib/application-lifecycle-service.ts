// Application Lifecycle Management Service
import { prisma } from '@/lib/prisma'
export interface ApplicationStage {
  id: string
  name: string
  description: string
  color: string
  icon: string
  nextStages: string[]
  allowedRoles: string[]
  actions: ApplicationAction[]
}

export interface ApplicationAction {
  id: string
  name: string
  description: string
  targetStage: string
  allowedRoles: string[]
  confirmationRequired: boolean
  confirmationMessage?: string
}

export interface ApplicationHistory {
  id: string
  applicationId: string
  fromStage: string
  toStage: string
  action: string
  performedBy: string
  performedByRole: string
  timestamp: string
  notes?: string
}

export interface ApplicationState {
  id: string
  applicantId: string
  jobId: string
  jobTitle: string
  employmentType: string
  resumeUrl: string
  additionalFiles: Array<{
    id: string
    fileName: string
    fileType: string
  }>
  coverLetter: string
  expectedSalary?: string
  status: string
  notes?: string
  submittedAt: string
  updatedAt: string
  // Related data from includes
  applicant?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  job?: {
    id: string
    title: string
    department?: {
      name: string
    }
  }
}

class ApplicationLifecycleService {
  private applications = new Map<string, ApplicationState>()
  private stages = new Map<string, ApplicationStage>()
  private listeners = new Set<(applications: ApplicationState[]) => void>()

  constructor() {
    this.initializeStages()
    // Mock data initialization removed - now using database
  }

  private initializeStages() {
    const stages: ApplicationStage[] = [
      {
        id: 'APPLIED',
        name: 'Applied',
        description: 'Application submitted by candidate',
        color: 'bg-blue-100 text-blue-800',
        icon: 'DocumentTextIcon',
        nextStages: ['UNDER_REVIEW', 'REJECTED'],
        allowedRoles: ['APPLICANT', 'HR', 'ADMIN'],
        actions: [
          {
            id: 'REVIEW',
            name: 'Start Review',
            description: 'Move application to review stage',
            targetStage: 'UNDER_REVIEW',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: false
          },
          {
            id: 'REJECT',
            name: 'Reject Application',
            description: 'Reject the application',
            targetStage: 'REJECTED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: true,
            confirmationMessage: 'Are you sure you want to reject this application?'
          }
        ]
      },
      {
        id: 'UNDER_REVIEW',
        name: 'Under Review',
        description: 'Application is being reviewed by HR',
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'EyeIcon',
        nextStages: ['INTERVIEW_SCHEDULED', 'REJECTED'],
        allowedRoles: ['HR', 'ADMIN'],
        actions: [
          {
            id: 'SCHEDULE_INTERVIEW',
            name: 'Schedule Interview',
            description: 'Schedule an interview with the candidate',
            targetStage: 'INTERVIEW_SCHEDULED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: false
          },
          {
            id: 'REJECT',
            name: 'Reject Application',
            description: 'Reject the application after review',
            targetStage: 'REJECTED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: true,
            confirmationMessage: 'Are you sure you want to reject this application?'
          }
        ]
      },
      {
        id: 'INTERVIEW_SCHEDULED',
        name: 'Interview Scheduled',
        description: 'Interview has been scheduled',
        color: 'bg-purple-100 text-purple-800',
        icon: 'CalendarIcon',
        nextStages: ['INTERVIEW_COMPLETED', 'INTERVIEW_CANCELLED'],
        allowedRoles: ['HR', 'ADMIN'],
        actions: [
          {
            id: 'COMPLETE_INTERVIEW',
            name: 'Complete Interview',
            description: 'Mark interview as completed',
            targetStage: 'INTERVIEW_COMPLETED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: false
          },
          {
            id: 'CANCEL_INTERVIEW',
            name: 'Cancel Interview',
            description: 'Cancel the scheduled interview',
            targetStage: 'INTERVIEW_CANCELLED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: true,
            confirmationMessage: 'Are you sure you want to cancel this interview?'
          }
        ]
      },
      {
        id: 'INTERVIEW_COMPLETED',
        name: 'Interview Completed',
        description: 'Interview has been completed',
        color: 'bg-indigo-100 text-indigo-800',
        icon: 'CheckCircleIcon',
        nextStages: ['HIRED', 'REJECTED'],
        allowedRoles: ['HR', 'ADMIN'],
        actions: [
          {
            id: 'HIRE',
            name: 'Hire Candidate',
            description: 'Make final decision to hire the candidate',
            targetStage: 'HIRED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: true,
            confirmationMessage: 'Are you sure you want to hire this candidate?'
          },
          {
            id: 'REJECT',
            name: 'Reject After Interview',
            description: 'Reject the candidate after interview',
            targetStage: 'REJECTED',
            allowedRoles: ['HR', 'ADMIN'],
            confirmationRequired: true,
            confirmationMessage: 'Are you sure you want to reject this candidate after the interview?'
          }
        ]
      },
      {
        id: 'HIRED',
        name: 'Hired',
        description: 'Candidate has been hired',
        color: 'bg-green-100 text-green-800',
        icon: 'CheckCircleIcon',
        nextStages: [],
        allowedRoles: ['HR', 'ADMIN'],
        actions: []
      },
      {
        id: 'REJECTED',
        name: 'Rejected',
        description: 'Application has been rejected',
        color: 'bg-red-100 text-red-800',
        icon: 'XCircleIcon',
        nextStages: [],
        allowedRoles: ['HR', 'ADMIN'],
        actions: []
      }
    ]

    stages.forEach(stage => {
      this.stages.set(stage.id, stage)
    })
  }

  private async initializeMockData() {
    // This service now works with database data
    // Mock data initialization is no longer needed
    // Applications will be loaded from the database via API calls
  }

  // Get all applications based on user role
  getApplications(userRole: string, userId?: string): ApplicationState[] {
    const allApplications = Array.from(this.applications.values())
    
    if (userRole === 'ADMIN') {
      return allApplications
    } else if (userRole === 'HR') {
      return allApplications // HR can see all applications for now
    } else if (userRole === 'APPLICANT') {
      return allApplications.filter(app => app.applicantId === userId)
    }
    
    return []
  }

  // Update application stage
  updateApplicationStage(
    applicationId: string,
    newStage: string,
    action: string,
    performedBy: string,
    performedByRole: string,
    notes?: string
  ): ApplicationState | null {
    const application = this.applications.get(applicationId)
    if (!application) return null

    // This method is now deprecated as updates are handled by the API
    // Keeping for backward compatibility but functionality moved to API
    return null
  }

  // Notify activity service about application stage changes
  private notifyActivityService(historyEntry: ApplicationHistory, jobTitle: string) {
    // Import activity service dynamically to avoid circular dependencies
    import('./activity-service').then(({ activityService }) => {
      activityService.addApplicationStageActivity(historyEntry, jobTitle)
    })
  }

  // Get available actions for current stage
  getAvailableActions(applicationId: string, userRole: string): ApplicationAction[] {
    // This method is now deprecated as actions are handled by the API
    // Keeping for backward compatibility but functionality moved to API
    return []
  }

  // Get stage information
  getStage(stageId: string): ApplicationStage | null {
    return this.stages.get(stageId) || null
  }

  // Subscribe to changes
  subscribe(listener: (applications: ApplicationState[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners
  private notifyListeners() {
    const allApplications = Array.from(this.applications.values())
    this.listeners.forEach(listener => listener(allApplications))
  }
}

// Export singleton instance
export const applicationLifecycleService = new ApplicationLifecycleService()
