// Application Lifecycle Management Service
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
  applicantName: string
  applicantEmail: string
  jobId: string
  jobTitle: string
  department: string
  company: string
  currentStage: string
  appliedDate: string
  resumeUrl: string
  coverLetter: string
  experience: string
  education: string
  skills: string[]
  additionalFiles: Array<{
    id: string
    fileName: string
    fileType: string
  }>
  notes: string
  interviewDate?: string
  interviewTime?: string
  interviewMode?: string
  history: ApplicationHistory[]
  createdAt: string
  updatedAt: string
}

class ApplicationLifecycleService {
  private applications = new Map<string, ApplicationState>()
  private stages = new Map<string, ApplicationStage>()
  private listeners = new Set<(applications: ApplicationState[]) => void>()

  constructor() {
    this.initializeStages()
    this.initializeMockData()
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

  private initializeMockData() {
    const mockApplications: ApplicationState[] = [
      {
        id: 'app-1',
        applicantId: 'user-1',
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@example.com',
        jobId: 'job-1',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        company: 'amealio',
        currentStage: 'UNDER_REVIEW',
        appliedDate: '2024-01-15',
        resumeUrl: '/api/files/resume-1',
        coverLetter: 'I am excited to apply for this position...',
        experience: '5+ years in software development',
        education: 'Bachelor of Computer Science',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        additionalFiles: [
          { id: 'resume-1', fileName: 'john-doe-resume.pdf', fileType: 'application/pdf' }
        ],
        notes: 'Strong technical background',
        interviewDate: '2024-01-25',
        interviewTime: '2:00 PM',
        interviewMode: 'Video Call',
        history: [
          {
            id: 'hist-1',
            applicationId: 'app-1',
            fromStage: 'APPLIED',
            toStage: 'UNDER_REVIEW',
            action: 'REVIEW',
            performedBy: 'hr-user-1',
            performedByRole: 'HR',
            timestamp: '2024-01-16T10:00:00Z',
            notes: 'Application moved to review stage'
          }
        ],
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      }
    ]

    mockApplications.forEach(app => {
      this.applications.set(app.id, app)
    })
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

    const currentStage = this.stages.get(application.currentStage)
    if (!currentStage) return null

    const allowedAction = currentStage.actions.find(a => a.id === action)
    if (!allowedAction) return null

    if (!allowedAction.allowedRoles.includes(performedByRole)) return null
    if (!currentStage.nextStages.includes(newStage)) return null

    const historyEntry: ApplicationHistory = {
      id: `hist-${Date.now()}`,
      applicationId,
      fromStage: application.currentStage,
      toStage: newStage,
      action,
      performedBy,
      performedByRole,
      timestamp: new Date().toISOString(),
      notes
    }

    const updatedApplication: ApplicationState = {
      ...application,
      currentStage: newStage,
      history: [...application.history, historyEntry],
      updatedAt: new Date().toISOString()
    }

    this.applications.set(applicationId, updatedApplication)
    this.notifyListeners()
    
    // Notify activity service about the change
    this.notifyActivityService(historyEntry, application.jobTitle)
    
    return updatedApplication
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
    const application = this.applications.get(applicationId)
    if (!application) return []

    const currentStage = this.stages.get(application.currentStage)
    if (!currentStage) return []

    return currentStage.actions.filter(action => 
      action.allowedRoles.includes(userRole)
    )
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
