import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { JobListingsSection } from '@/components/sections/JobListingsSection'
import { CompanyValuesSection } from '@/components/sections/CompanyValuesSection'
import { ApplicationProcessSection } from '@/components/sections/ApplicationProcessSection'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-900">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
        <JobListingsSection />
        <CompanyValuesSection />
        <ApplicationProcessSection />
        <Footer />
      </Suspense>
    </main>
  )
}
