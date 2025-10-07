// Admin-specific types that align with database schema
import { UserRole, ApplicationStatus, HRRequestStatus, InterviewStatus, InterviewType, EmploymentType } from '@prisma/client'

// User types
export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface HRUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  address: string | null
  dateOfBirth: Date | null
  linkedinProfile: string | null
  profileImage: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  hrJobs: Job[]
  hrReviews: InterviewReview[]
  applicationsReviewed: number
  averageReviewTime: number
}

export interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  address: string | null
  dateOfBirth: Date | null
  linkedinProfile: string | null
  profileImage: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  applications: Application[]
}

// Application types
export interface Application {
  id: string
  jobTitle: string
  employmentType: EmploymentType
  resumeUrl: string
  additionalFiles: string[]
  coverLetter: string | null
  expectedSalary: string | null
  experience: string | null
  education: string | null
  skills: string | null
  availability: string | null
  references: string | null
  status: ApplicationStatus
  submittedAt: Date
  updatedAt: Date
  applicantId: string
  jobId: string
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
}

export interface ApplicationHistory {
  id: string
  applicationId: string
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  action: string
  performedBy: string
  performedByName: string
  performedByRole: UserRole
  notes: string | null
  createdAt: Date
}

// Job types
export interface Job {
  id: string
  title: string
  departmentId: string
  summary: string | null
  employmentTypes: EmploymentType[]
  applicationDeadline: Date | null
  requiredSkills: string[]
  isActive: boolean
  isDraft: boolean
  createdAt: Date
  updatedAt: Date
  createdById: string
  department: {
    id: string
    name: string
    description: string | null
    isActive: boolean
  }
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  jobDescription?: {
    id: string
    description: string
    responsibilities: string[]
    requirements: string[]
    benefits: string[]
    location: string | null
    remoteWork: boolean
  }
  applications: Application[]
  _count: {
    applications: number
  }
}

// Interview types
export interface Interview {
  id: string
  candidate: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  application: {
    id: string
    jobTitle: string
    status: ApplicationStatus
    submittedAt: Date
    department: string
  }
  interviewDetails: {
    scheduledAt: Date
    interviewType: InterviewType
    location: string | null
    meetingLink: string | null
    status: InterviewStatus
    notes: string | null
  }
  hrInterviewer: {
    name: string
    email: string | null
  } | null
  reviews: InterviewReview[]
  createdAt: Date
  updatedAt: Date
}

export interface InterviewReview {
  id: string
  technicalSkills: number
  communication: number
  culturalFit: number
  overallRating: number
  comments: string
  recommendation: string
  createdAt: Date
  updatedAt: Date
  interviewId: string
  hrReviewerId: string
  adminReviewerId: string | null
  hrReviewer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  adminReviewer?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

// HR Request types
export interface HRRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  department: string | null
  reason: string | null
  status: HRRequestStatus
  requestedBy: string
  requestedByName: string
  approvedBy: string | null
  approvedByName: string | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
  approvedAt: Date | null
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  userId: string
  applicationId: string | null
  interviewId: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  application?: {
    id: string
    jobTitle: string
  } | null
  interview?: {
    id: string
    scheduledAt: Date
  } | null
}

// Department types
export interface Department {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    jobs: number
  }
}

// System types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  description: string | null
  updatedAt: Date
}

// Dashboard statistics types
export interface DashboardStats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalInterviews: number
  pendingHRRequests: number
  activeJobs: number
  recentApplications: number
  upcomingInterviews: number
  // Legacy properties for backward compatibility
  pendingReviews?: number
  hired?: number
  rejected?: number
  averageTimeToHire?: number
  departmentStats?: Record<string, { applications: number; hired: number; pending: number }>
  // New stage-specific statistics
  stageStats?: {
    pending: number
    underReview: number
    interviewScheduled: number
    interviewCompleted: number
    accepted: number
    hired: number
    rejected: number
  }
}

export interface HRPerformanceMetrics {
  id: string
  firstName: string
  lastName: string
  email: string
  jobsPosted: number
  applicantsReviewed: number
  averageReviewTime: number
  totalInterviews: number
  averageRating: number
  createdAt: Date
  isActive: boolean
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Dashboard-specific types for backward compatibility
export interface DashboardApplicant {
  id: string
  name: string
  email: string
  position: string
  status: string
  applicationDate: string
  interviewScore: number
  hrRecommendation: string
  backgroundCheck: string
  referenceCheck: string
  experience: string
  skills: string[]
}

export interface DashboardHRUser {
  id: string
  name: string
  email: string
  department: string
  createdAt: string
  activeJobs: number
  totalHires: number
}
