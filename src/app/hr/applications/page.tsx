'use client'

import ApplicationManagement from '@/components/application/ApplicationManagement'

export default function HRApplicationsPage() {
  return (
    <ApplicationManagement
      userRole="HR"
      title="HR Applications Management"
      description="Manage applications for jobs you created"
      backUrl="/hr/dashboard"
    />
  )
}