export interface ActivityItem {
  id: string
  type: 'application' | 'interview' | 'profile_update' | 'job_view' | 'status_change' | 'application_submitted' | 'application_reviewed' | 'interview_scheduled' | 'interview_completed' | 'application_accepted' | 'application_rejected' | 'interview_cancelled' | 'application_updated'
  title: string
  description: string
  date: string
  status: 'pending' | 'review' | 'success' | 'scheduled' | 'completed' | 'error' | 'info' | 'warning'
  jobId?: string
  applicationId?: string
  metadata?: {
    position?: string
    company?: string
    location?: string
    department?: string
    experience?: string
    skills?: string
    interviewDate?: string
    interviewType?: string
    oldStatus?: string
    newStatus?: string
    updatedFields?: string[]
    relatedJob?: string
    // New fields for application lifecycle integration
    fromStage?: string
    toStage?: string
    action?: string
    performedBy?: string
    performedByRole?: string
    notes?: string
    timestamp?: string
  }
}

class ActivityService {
  private activities: ActivityItem[] = []
  private listeners: ((activities: ActivityItem[]) => void)[] = []

  constructor() {
    this.loadInitialActivities()
    this.subscribeToApplicationChanges()
  }

  private subscribeToApplicationChanges() {
    // Import application lifecycle service dynamically to avoid circular dependencies
    import('./application-lifecycle-service').then(({ applicationLifecycleService }) => {
      applicationLifecycleService.subscribe((applications) => {
        // This will be called whenever application stages change
        // We'll add new activities for stage changes
      })
    })
  }

  // Add activity from application stage change
  addApplicationStageActivity(historyEntry: {
    id: string
    action: string
    toStage: string
    performedBy: string
    performedByRole: string
    notes?: string
    applicationId?: string
    fromStage?: string
    timestamp?: string
  }, applicationTitle: string) {
    const activityType = this.getActivityTypeFromAction(historyEntry.action)
    const activityTitle = this.getActivityTitleFromAction(historyEntry.action)
    const activityDescription = this.getActivityDescriptionFromAction(historyEntry, applicationTitle)
    const activityStatus = this.getActivityStatusFromStage(historyEntry.toStage)

    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}-${historyEntry.id}`,
      type: activityType,
      title: activityTitle,
      description: activityDescription,
      date: 'Just now',
      status: activityStatus,
      applicationId: historyEntry.applicationId,
      metadata: {
        fromStage: historyEntry.fromStage,
        toStage: historyEntry.toStage,
        action: historyEntry.action,
        performedBy: historyEntry.performedBy,
        performedByRole: historyEntry.performedByRole,
        notes: historyEntry.notes,
        timestamp: historyEntry.timestamp,
        position: applicationTitle
      }
    }

    // Add to beginning of array (most recent first)
    this.activities.unshift(newActivity)
    
    // Notify all listeners
    this.notifyListeners()
  }

  private getActivityTypeFromAction(action: string): ActivityItem['type'] {
    switch (action) {
      case 'APPLY':
        return 'application_submitted'
      case 'REVIEW':
        return 'application_reviewed'
      case 'SCHEDULE_INTERVIEW':
        return 'interview_scheduled'
      case 'COMPLETE_INTERVIEW':
        return 'interview_completed'
      case 'HIRE':
        return 'application_accepted'
      case 'REJECT':
        return 'application_rejected'
      case 'CANCEL_INTERVIEW':
        return 'interview_cancelled'
      default:
        return 'application_updated'
    }
  }

  private getActivityTitleFromAction(action: string): string {
    switch (action) {
      case 'APPLY':
        return 'Application Submitted'
      case 'REVIEW':
        return 'Application Under Review'
      case 'SCHEDULE_INTERVIEW':
        return 'Interview Scheduled'
      case 'COMPLETE_INTERVIEW':
        return 'Interview Completed'
      case 'HIRE':
        return 'Application Accepted'
      case 'REJECT':
        return 'Application Rejected'
      case 'CANCEL_INTERVIEW':
        return 'Interview Cancelled'
      default:
        return 'Application Updated'
    }
  }

  private getActivityDescriptionFromAction(historyEntry: {
    id: string
    action: string
    toStage: string
    performedBy: string
    performedByRole: string
    notes?: string
    applicationId?: string
    fromStage?: string
    timestamp?: string
  }, applicationTitle: string): string {
    const { action, toStage, performedByRole, notes } = historyEntry
    
    let description = ''
    
    switch (action) {
      case 'APPLY':
        description = `Applied for ${applicationTitle} position`
        break
      case 'REVIEW':
        description = `Your application for ${applicationTitle} is now under review`
        break
      case 'SCHEDULE_INTERVIEW':
        description = `Interview scheduled for ${applicationTitle} position`
        break
      case 'COMPLETE_INTERVIEW':
        description = `Interview completed for ${applicationTitle} position`
        break
      case 'HIRE':
        description = `Congratulations! You've been hired for ${applicationTitle} position`
        break
      case 'REJECT':
        description = `Application for ${applicationTitle} position was not successful`
        break
      case 'CANCEL_INTERVIEW':
        description = `Interview for ${applicationTitle} position was cancelled`
        break
      default:
        description = `Application for ${applicationTitle} has been updated`
    }

    if (notes) {
      description += ` - ${notes}`
    }

    if (performedByRole !== 'APPLICANT') {
      description += ` (Updated by ${performedByRole})`
    }

    return description
  }

  private getActivityStatusFromStage(stage: string): ActivityItem['status'] {
    switch (stage) {
      case 'HIRED':
        return 'success'
      case 'REJECTED':
        return 'error'
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_COMPLETED':
        return 'success'
      case 'UNDER_REVIEW':
        return 'info'
      case 'INTERVIEW_CANCELLED':
        return 'warning'
      default:
        return 'info'
    }
  }

  private loadInitialActivities() {
    // Initialize with empty array - activities will be loaded from API
    this.activities = []
  }

  // Get all activities sorted by date (newest first)
  getAllActivities(): ActivityItem[] {
    return [...this.activities].sort((a, b) => {
      // Convert date strings to comparable values
      const getDateValue = (dateStr: string) => {
        if (dateStr === 'Just now') return Date.now()
        if (dateStr.includes('day')) {
          const days = parseInt(dateStr.split(' ')[0])
          return Date.now() - (days * 24 * 60 * 60 * 1000)
        }
        if (dateStr.includes('week')) {
          const weeks = parseInt(dateStr.split(' ')[0])
          return Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000)
        }
        if (dateStr.includes('hour')) {
          const hours = parseInt(dateStr.split(' ')[0])
          return Date.now() - (hours * 60 * 60 * 1000)
        }
        if (dateStr.includes('minute')) {
          const minutes = parseInt(dateStr.split(' ')[0])
          return Date.now() - (minutes * 60 * 1000)
        }
        // For specific dates like '2024-01-25'
        if (dateStr.includes('-')) {
          return new Date(dateStr).getTime()
        }
        return Date.now()
      }
      
      return getDateValue(b.date) - getDateValue(a.date)
    })
  }

  // Get recent activities (first 3 from sorted list)
  getRecentActivities(): ActivityItem[] {
    return this.getAllActivities().slice(0, 3)
  }

  // Add new activity
  addActivity(activity: Omit<ActivityItem, 'id'>): void {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    this.activities.unshift(newActivity) // Add to beginning
    this.notifyListeners()
  }

  // Track application submission
  trackApplicationSubmission(jobTitle: string, jobId: string, applicationId: string): void {
    this.addActivity({
      type: 'application',
      title: 'Application Submitted',
      description: `${jobTitle} at amealio`,
      date: 'Just now',
      status: 'pending',
      jobId,
      applicationId,
      metadata: {
        position: jobTitle,
        company: 'amealio'
      }
    })
  }

  // Track application status change
  trackApplicationStatusChange(
    jobTitle: string, 
    jobId: string, 
    applicationId: string, 
    oldStatus: string, 
    newStatus: string
  ): void {
    this.addActivity({
      type: 'status_change',
      title: 'Application Status Changed',
      description: `${jobTitle} application moved to ${newStatus.toLowerCase().replace('_', ' ')}`,
      date: 'Just now',
      status: 'success',
      jobId,
      applicationId,
      metadata: {
        position: jobTitle,
        company: 'amealio',
        oldStatus,
        newStatus
      }
    })
  }

  // Track profile update
  trackProfileUpdate(updatedFields: string[]): void {
    const fieldNames = updatedFields.map(field => {
      switch (field) {
        case 'firstName': return 'First Name'
        case 'lastName': return 'Last Name'
        case 'email': return 'Email'
        case 'phoneNumber': return 'Phone Number'
        case 'address': return 'Address'
        case 'linkedinProfile': return 'LinkedIn Profile'
        case 'skills': return 'Skills'
        case 'experience': return 'Experience'
        case 'education': return 'Education'
        default: return field
      }
    }).join(', ')

    this.addActivity({
      type: 'profile_update',
      title: 'Profile Updated',
      description: `${fieldNames} updated`,
      date: 'Just now',
      status: 'success',
      metadata: {
        updatedFields
      }
    })
  }

  // Track job view
  trackJobView(jobTitle: string, jobId: string): void {
    this.addActivity({
      type: 'job_view',
      title: 'Job Viewed',
      description: `${jobTitle} position viewed`,
      date: 'Just now',
      status: 'success',
      jobId,
      metadata: {
        position: jobTitle,
        company: 'amealio'
      }
    })
  }

  // Track interview scheduling
  trackInterviewScheduled(
    jobTitle: string, 
    jobId: string, 
    applicationId: string, 
    interviewDate: string, 
    interviewType: string
  ): void {
    this.addActivity({
      type: 'interview',
      title: 'Interview Scheduled',
      description: `${jobTitle} - ${interviewType}`,
      date: 'Just now',
      status: 'scheduled',
      jobId,
      applicationId,
      metadata: {
        position: jobTitle,
        company: 'amealio',
        interviewDate,
        interviewType
      }
    })
  }

  // Subscribe to activity changes
  subscribe(listener: (activities: ActivityItem[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.activities]))
  }
}

// Export singleton instance
export const activityService = new ActivityService()
