'use client'

import ApplicationManagement from '@/components/application/ApplicationManagement'

export default function AdminApplicationsPage() {
  return (
    <ApplicationManagement
      userRole="ADMIN"
      title="All Applications Management"
      description="Manage all job applications across the platform"
      backUrl="/admin/dashboard"
    />
  )
}
