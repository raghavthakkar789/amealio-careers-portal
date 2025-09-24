export interface ActivityItem {
  id: string
  type: 'application' | 'interview' | 'profile_update' | 'job_view' | 'status_change'
  title: string
  description: string
  date: string
  status: 'pending' | 'review' | 'success' | 'scheduled' | 'completed'
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
  }
}

class ActivityService {
  private activities: ActivityItem[] = []
  private listeners: ((activities: ActivityItem[]) => void)[] = []

  constructor() {
    this.loadInitialActivities()
  }

  private loadInitialActivities() {
    this.activities = [
      {
        id: '1',
        type: 'application',
        title: 'Application Submitted',
        description: 'Senior Software Engineer at amealio - Pending Review',
        date: '2 days ago',
        status: 'pending',
        jobId: '1',
        applicationId: 'app-1',
        metadata: {
          position: 'Senior Software Engineer',
          company: 'amealio',
          location: 'Remote',
          department: 'Engineering',
          experience: '5+ years',
          skills: 'React, Node.js, TypeScript, AWS'
        }
      },
      {
        id: '2',
        type: 'interview',
        title: 'Interview Scheduled',
        description: 'Product Manager position - Video Interview',
        date: '1 week ago',
        status: 'scheduled',
        jobId: '2',
        applicationId: 'app-2',
        metadata: {
          position: 'Product Manager',
          company: 'amealio',
          interviewDate: '2024-01-25',
          interviewType: 'Video Call'
        }
      },
      {
        id: '3',
        type: 'profile_update',
        title: 'Profile Updated',
        description: 'Skills & Experience section updated',
        date: '3 days ago',
        status: 'success',
        metadata: {
          updatedFields: ['skills', 'experience']
        }
      },
      {
        id: '4',
        type: 'application',
        title: 'Application Status Changed',
        description: 'UX Designer application moved to interview stage',
        date: '5 days ago',
        status: 'success',
        jobId: '3',
        applicationId: 'app-3',
        metadata: {
          position: 'UX Designer',
          company: 'amealio',
          oldStatus: 'UNDER_REVIEW',
          newStatus: 'INTERVIEW_SCHEDULED'
        }
      },
      {
        id: '5',
        type: 'job_view',
        title: 'Job Viewed',
        description: 'Data Analyst position viewed',
        date: '1 week ago',
        status: 'success',
        jobId: '4',
        metadata: {
          position: 'Data Analyst',
          company: 'amealio'
        }
      },
      {
        id: '8',
        type: 'job_view',
        title: 'Job Viewed',
        description: 'Senior Software Engineer position viewed',
        date: '4 days ago',
        status: 'success',
        jobId: '1',
        metadata: {
          position: 'Senior Software Engineer',
          company: 'amealio',
          department: 'Engineering'
        }
      },
      {
        id: '9',
        type: 'profile_update',
        title: 'Profile Updated',
        description: 'Skills and experience updated before applying for Senior Software Engineer position',
        date: '3 days ago',
        status: 'success',
        metadata: {
          updatedFields: ['skills', 'experience', 'linkedinProfile'],
          relatedJob: '1'
        }
      }
    ]
  }

  // Get all activities
  getAllActivities(): ActivityItem[] {
    return [...this.activities]
  }

  // Get recent activities (last 3)
  getRecentActivities(): ActivityItem[] {
    return this.activities.slice(0, 3)
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
