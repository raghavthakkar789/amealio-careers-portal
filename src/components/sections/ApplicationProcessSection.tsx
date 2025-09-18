'use client'

import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

const steps = [
  {
    icon: DocumentTextIcon,
    title: 'Submit Application',
    description: 'Fill out our comprehensive application form with your details, resume, and cover letter.',
    step: '01'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'HR Review',
    description: 'Our HR team reviews your application and assesses your fit for the position.',
    step: '02'
  },
  {
    icon: CalendarIcon,
    title: 'Interview Process',
    description: 'Participate in interviews with our team members and showcase your skills.',
    step: '03'
  },
  {
    icon: CheckCircleIcon,
    title: 'Final Decision',
    description: 'Receive our decision and next steps for joining the amealio team.',
    step: '04'
  }
]

export function ApplicationProcessSection() {
  return (
    <section className="py-20 bg-bg-850">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-high mb-4">
            Application Process
          </h2>
          <p className="text-xl text-text-mid max-w-2xl mx-auto">
            Our streamlined application process ensures a smooth experience from start to finish.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-purple-200 z-0" />
              )}
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary text-white hover:bg-primary-hover transition-all duration-300 hover:scale-110">
                  <step.icon className="w-8 h-8" />
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border border-purple-200">
                  <span className="text-sm font-bold text-primary">
                    {step.step}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-text-high mb-3">
                  {step.title}
                </h3>
                <p className="text-text-mid leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >

          <div className="bg-bg-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-lg border border-border">
            <h3 className="text-2xl font-bold text-text-high mb-4">
              What to Expect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-text-high mb-2">Timeline</h4>
                <p className="text-text-mid text-sm">
                  Complete application process typically takes 2-4 weeks from initial submission to final decision.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-text-high mb-2">Communication</h4>
                <p className="text-text-mid text-sm">
                  Regular updates via email and our portal. You'll always know where you stand in the process.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-text-high mb-2">Support</h4>
                <p className="text-text-mid text-sm">
                  Our HR team is here to help. Don't hesitate to reach out with any questions or concerns.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
