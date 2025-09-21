'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export function HeroSection() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Join the{' '}
            <span className="relative inline-block">
              {/* Main text with strong gradient */}
              <span className="relative z-10 text-gradient-light bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl font-black tracking-wide">
                amealio
              </span>
              {/* Outer glow layer */}
              <span className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent blur-lg opacity-70">
                amealio
              </span>
              {/* Inner glow layer */}
              <span className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent blur-md opacity-90">
                amealio
              </span>
              {/* Subtle shadow layer */}
              <span className="absolute inset-0 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent blur-sm opacity-60 translate-x-1 translate-y-1">
                amealio
              </span>
            </span>{' '}
            Team
          </h1>
          
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto text-purple-100">
            Build the future with us. We&apos;re looking for passionate individuals who want to make a difference in the world through innovative technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.push('/jobs')}
              className="btn-primary text-lg px-8 py-4 bg-white text-primary hover:bg-purple-50 hover:text-primary-hover shadow-large hover:shadow-xl"
            >
              Browse Open Positions
            </Button>
            
            {session ? (
              <Button
                onClick={() => {
                  // Redirect based on user role
                  if (session.user?.role === 'ADMIN') {
                    router.push('/admin/dashboard')
                  } else if (session.user?.role === 'HR') {
                    router.push('/hr/dashboard')
                  } else {
                    router.push('/dashboard')
                  }
                }}
                variant="secondary"
                className="btn-secondary text-lg px-8 py-4 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                variant="secondary"
                className="btn-secondary text-lg px-8 py-4 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                Sign In
              </Button>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-purple-200">Open Positions</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">6</div>
              <div className="text-purple-200">Departments</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-purple-200">Happy Employees</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        onClick={() => {
          const jobSection = document.querySelector('#job-listings')
          if (jobSection) {
            jobSection.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center hover:border-white/60 transition-colors">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.button>
    </section>
  )
}
