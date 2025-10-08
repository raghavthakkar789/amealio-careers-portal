'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  LightBulbIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  UsersIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const values = [
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'We innovate fearlessly, turning bold ideas into breakthrough solutions.',
    color: 'text-yellow-500'
  },
  {
    icon: HeartIcon,
    title: 'Passion',
    description: 'We\'re driven by purpose, committed to making a meaningful impact in everything we do.',
    color: 'text-red-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Integrity',
    description: 'We operate with transparency, honesty, and ethical practices in all our work.',
    color: 'text-green-500'
  },
  {
    icon: UsersIcon,
    title: 'Collaboration',
    description: 'We believe in the power of diverse teams to achieve extraordinary results.',
    color: 'text-blue-500'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Excellence',
    description: 'We pursue excellence in every project, product, and customer interaction.',
    color: 'text-purple-500'
  },
  {
    icon: SparklesIcon,
    title: 'Growth',
    description: 'We foster continuous learning and personal development for every team member.',
    color: 'text-pink-500'
  }
]

export function CompanyValuesSection() {
  const router = useRouter()

  return (
    <section className="py-20 bg-bg-850">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Our Values
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            These core values guide everything we do and shape our company culture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[#40299B]/10 group-hover:bg-[#40299B]/20 transition-all duration-300 hover:scale-110">
                <value.icon className={`w-8 h-8 ${value.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {value.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-bg-800 rounded-2xl p-8 max-w-4xl mx-auto border border-border">
            <h3 className="text-2xl font-bold text-text-high mb-4">
              Join Our Mission
            </h3>
            <p className="text-lg text-text-mid mb-6">
              We&apos;re building the future, not just products. 
              Join a team that values your perspective and supports your growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/jobs')}
                className="btn-primary"
              >
                Explore Opportunities
              </button>
              <button 
                onClick={() => router.push('/culture')}
                className="btn-secondary"
              >
                Learn About Culture
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
