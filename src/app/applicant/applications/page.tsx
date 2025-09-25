'use client'

import ApplicationManagement from '@/components/application/ApplicationManagement'

export default function ApplicantApplicationsPage() {
  return (
    <ApplicationManagement
      userRole="APPLICANT"
      title="My Applications"
      description="Track the status of your job applications"
      backUrl="/applicant/dashboard"
    />
  )
}