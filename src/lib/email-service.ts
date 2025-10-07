// Email Service for Application Workflow Notifications
import { prisma } from '@/lib/prisma'
import { EmailType, EmailStatus, ApplicationStatus } from '@prisma/client'

export interface EmailTemplate {
  subject: string
  body: string
}

export interface EmailRecipients {
  to: string
  cc: string[]
}

export interface EmailData {
  applicantName: string
  jobTitle: string
  companyName: string
  applicationId: string
  submissionDate?: string
  interviewDate?: string
  interviewTime?: string
  interviewDuration?: string
  interviewType?: string
  interviewLocation?: string
  interviewerName?: string
  specialInstructions?: string
  adminName?: string
  hrName?: string
}

class EmailService {
  private companyName = 'amealio'
  private fromEmail = 'noreply@amealio.com'
  private fromName = 'amealio Recruitment Team'

  // Get all admin emails for CC
  private async getAdminEmails(): Promise<string[]> {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true
      },
      select: {
        email: true
      }
    })
    return admins.map(admin => admin.email)
  }

  // Get HR email for specific application
  private async getHrEmail(applicationId: string): Promise<string | null> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        acceptedByHrUser: {
          select: { email: true }
        }
      }
    })
    return application?.acceptedByHrUser?.email || null
  }

  // Get recipients for email
  private async getRecipients(applicationId: string, includeHr: boolean = true): Promise<EmailRecipients> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: {
          select: { email: true }
        }
      }
    })

    if (!application) {
      throw new Error('Application not found')
    }

    const ccEmails: string[] = []
    
    // Add all admin emails
    const adminEmails = await this.getAdminEmails()
    ccEmails.push(...adminEmails)

    // Add HR email if requested
    if (includeHr) {
      const hrEmail = await this.getHrEmail(applicationId)
      if (hrEmail) {
        ccEmails.push(hrEmail)
      }
    }

    return {
      to: application.applicant.email,
      cc: ccEmails
    }
  }

  // Email Template 1: Application Submission Confirmation
  private getSubmissionEmailTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `Application Received - ${data.jobTitle} at ${data.companyName}`,
      body: `
Dear ${data.applicantName},

Thank you for applying for the position of ${data.jobTitle} at ${data.companyName}.

We have successfully received your application submitted on ${data.submissionDate}. Our hiring team will carefully review your qualifications and experience.

Application Details:
- Position: ${data.jobTitle}
- Application ID: ${data.applicationId}
- Submission Date: ${data.submissionDate}

We will keep you updated on the status of your application. If your qualifications match our requirements, we will contact you to discuss the next steps in our hiring process.

Thank you for your interest in joining our team.

Best regards,
${data.companyName} Recruitment Team

---
This is an automated message. Please do not reply to this email.
      `.trim()
    }
  }

  // Email Template 2: Interview Scheduled Notification
  private getInterviewEmailTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `Interview Scheduled - ${data.jobTitle} at ${data.companyName}`,
      body: `
Dear ${data.applicantName},

Congratulations! We are pleased to invite you for an interview for the position of ${data.jobTitle} at ${data.companyName}.

Interview Details:
- Date: ${data.interviewDate}
- Time: ${data.interviewTime} (Duration: ${data.interviewDuration})
- Type: ${data.interviewType}
- Location/Meeting Link: ${data.interviewLocation}
- Interviewer: ${data.interviewerName}

Special Instructions:
${data.specialInstructions || 'None provided'}

Please confirm your availability by replying to this email. If you need to reschedule, please contact us at least 24 hours in advance.

What to Prepare:
- Bring a copy of your resume
- Be prepared to discuss your experience and qualifications
- ${data.interviewType === 'VIDEO' ? 'Ensure you have a stable internet connection and a quiet environment' : 'Arrive 10 minutes early'}

We look forward to meeting you and learning more about your qualifications.

Best regards,
${data.companyName} Recruitment Team

---
If you have any questions, please feel free to contact us.
      `.trim()
    }
  }

  // Email Template 3: Congratulations - Hired
  private getHiredEmailTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `Congratulations! Job Offer - ${data.jobTitle} at ${data.companyName}`,
      body: `
Dear ${data.applicantName},

Congratulations! We are delighted to inform you that you have been selected for the position of ${data.jobTitle} at ${data.companyName}.

We were impressed with your qualifications, experience, and performance throughout the interview process. We believe you will be a valuable addition to our team.

Next Steps:
Our HR team will contact you within the next 3-5 business days with:
- Formal offer letter
- Employment terms and conditions
- Joining date and onboarding details
- Required documentation

In the meantime, if you have any questions, please feel free to reach out to our HR department.

We are excited to welcome you to ${data.companyName} and look forward to working with you.

Warm regards,

${data.adminName}
${data.companyName} Management

---
Please keep this information confidential until you receive the formal offer letter.
      `.trim()
    }
  }

  // Email Template 4: Application Rejection
  private getRejectionEmailTemplate(data: EmailData, wasInterviewed: boolean = false): EmailTemplate {
    const interviewText = wasInterviewed ? ' and for taking the time to participate in our interview process' : ''
    const interviewPerformanceText = wasInterviewed ? ' and interview performance' : ''
    
    return {
      subject: `Application Status Update - ${data.jobTitle} at ${data.companyName}`,
      body: `
Dear ${data.applicantName},

Thank you for your interest in the ${data.jobTitle} position at ${data.companyName}${interviewText}.

After careful consideration of your application${interviewPerformanceText}, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We genuinely appreciate the effort you put into your application${interviewText}. Your background and experience are impressive, and we encourage you to apply for future openings that align with your skills and career goals.

We will keep your resume on file and may reach out if a suitable opportunity arises in the future.

Thank you once again for considering ${data.companyName} as your potential employer. We wish you every success in your career journey.

Best regards,

${data.companyName} Recruitment Team

---
This decision is final. We appreciate your understanding.
      `.trim()
    }
  }

  // Log email to database
  private async logEmail(
    applicationId: string,
    emailType: EmailType,
    recipients: EmailRecipients,
    template: EmailTemplate,
    status: EmailStatus,
    errorMessage?: string
  ): Promise<void> {
    await prisma.emailLog.create({
      data: {
        applicationId,
        emailType,
        recipientEmail: recipients.to,
        ccEmails: JSON.stringify(recipients.cc),
        subject: template.subject,
        body: template.body,
        status,
        errorMessage
      }
    })
  }

  // Send email (placeholder - implement with actual email service)
  private async sendEmail(
    recipients: EmailRecipients,
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      // TODO: Implement actual email sending logic
      // This could use services like SendGrid, AWS SES, Nodemailer, etc.
      
      console.log('Sending email:', {
        to: recipients.to,
        cc: recipients.cc,
        subject: template.subject
      })

      // For now, simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  // Public method to send application submission confirmation
  async sendApplicationSubmissionEmail(applicationId: string): Promise<boolean> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          applicant: {
            select: { firstName: true, lastName: true }
          },
          job: {
            select: { title: true }
          }
        }
      })

      if (!application) {
        throw new Error('Application not found')
      }

      const recipients = await this.getRecipients(applicationId)
      const emailData: EmailData = {
        applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
        jobTitle: application.job.title,
        companyName: this.companyName,
        applicationId: application.id,
        submissionDate: application.submittedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      const template = this.getSubmissionEmailTemplate(emailData)
      const success = await this.sendEmail(recipients, template)
      
      await this.logEmail(
        applicationId,
        EmailType.SUBMISSION,
        recipients,
        template,
        success ? EmailStatus.SENT : EmailStatus.FAILED,
        success ? undefined : 'Email sending failed'
      )

      return success
    } catch (error) {
      console.error('Failed to send application submission email:', error)
      return false
    }
  }

  // Public method to send interview scheduled notification
  async sendInterviewScheduledEmail(applicationId: string, interviewId: string): Promise<boolean> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          applicant: {
            select: { firstName: true, lastName: true }
          },
          job: {
            select: { title: true }
          }
        }
      })

      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          candidate: {
            select: { firstName: true, lastName: true }
          }
        }
      })

      if (!application || !interview) {
        throw new Error('Application or interview not found')
      }

      const recipients = await this.getRecipients(applicationId)
      const emailData: EmailData = {
        applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
        jobTitle: application.job.title,
        companyName: this.companyName,
        applicationId: application.id,
        interviewDate: interview.scheduledAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        interviewTime: interview.scheduledAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        interviewDuration: '60 minutes', // Default duration
        interviewType: interview.interviewType.replace('_', ' '),
        interviewLocation: interview.location || interview.meetingLink || 'To be confirmed',
        interviewerName: 'HR Team', // Extract from notes or interviewer field
        specialInstructions: interview.notes || 'None provided'
      }

      const template = this.getInterviewEmailTemplate(emailData)
      const success = await this.sendEmail(recipients, template)
      
      await this.logEmail(
        applicationId,
        EmailType.INTERVIEW,
        recipients,
        template,
        success ? EmailStatus.SENT : EmailStatus.FAILED,
        success ? undefined : 'Email sending failed'
      )

      return success
    } catch (error) {
      console.error('Failed to send interview scheduled email:', error)
      return false
    }
  }

  // Public method to send hired congratulations email
  async sendHiredEmail(applicationId: string, adminId: string): Promise<boolean> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          applicant: {
            select: { firstName: true, lastName: true }
          },
          job: {
            select: { title: true }
          },
          finalDecisionByUser: {
            select: { firstName: true, lastName: true }
          }
        }
      })

      if (!application) {
        throw new Error('Application not found')
      }

      const recipients = await this.getRecipients(applicationId)
      const emailData: EmailData = {
        applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
        jobTitle: application.job.title,
        companyName: this.companyName,
        applicationId: application.id,
        adminName: `${application.finalDecisionByUser?.firstName} ${application.finalDecisionByUser?.lastName}`
      }

      const template = this.getHiredEmailTemplate(emailData)
      const success = await this.sendEmail(recipients, template)
      
      await this.logEmail(
        applicationId,
        EmailType.HIRED,
        recipients,
        template,
        success ? EmailStatus.SENT : EmailStatus.FAILED,
        success ? undefined : 'Email sending failed'
      )

      return success
    } catch (error) {
      console.error('Failed to send hired email:', error)
      return false
    }
  }

  // Public method to send rejection email
  async sendRejectionEmail(applicationId: string, wasInterviewed: boolean = false): Promise<boolean> {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          applicant: {
            select: { firstName: true, lastName: true }
          },
          job: {
            select: { title: true }
          }
        }
      })

      if (!application) {
        throw new Error('Application not found')
      }

      const recipients = await this.getRecipients(applicationId)
      const emailData: EmailData = {
        applicantName: `${application.applicant.firstName} ${application.applicant.lastName}`,
        jobTitle: application.job.title,
        companyName: this.companyName,
        applicationId: application.id
      }

      const template = this.getRejectionEmailTemplate(emailData, wasInterviewed)
      const success = await this.sendEmail(recipients, template)
      
      await this.logEmail(
        applicationId,
        EmailType.REJECTED,
        recipients,
        template,
        success ? EmailStatus.SENT : EmailStatus.FAILED,
        success ? undefined : 'Email sending failed'
      )

      return success
    } catch (error) {
      console.error('Failed to send rejection email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
