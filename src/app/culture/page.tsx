'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ArrowLeftIcon, PlayIcon, HeartIcon, RocketLaunchIcon, UsersIcon, LightBulbIcon, GlobeAltIcon, SparklesIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CulturePage() {
  const router = useRouter()

  const perks = [
    {
      icon: RocketLaunchIcon,
      title: 'AI Implementation for Solving Real-World Problems',
      description: 'Apply artificial intelligence to tackle genuine challenges in food discovery, personalization, and community building.',
      color: 'text-blue-500'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'Join a mission to connect communities worldwide through food, culture, and technology.',
      color: 'text-green-500'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation Culture',
      description: 'Be part of a team that encourages creative thinking and breakthrough solutions.',
      color: 'text-yellow-500'
    },
    {
      icon: UsersIcon,
      title: 'Collaborative Environment',
      description: 'Work alongside passionate professionals who share your vision for meaningful impact.',
      color: 'text-purple-500'
    },
    {
      icon: HeartIcon,
      title: 'Purpose-Driven Work',
      description: 'Every project contributes to making food experiences more personal and joyful.',
      color: 'text-red-500'
    },
    {
      icon: SparklesIcon,
      title: 'Growth Opportunities',
      description: 'Accelerate your career in a fast-growing startup with unlimited potential.',
      color: 'text-pink-500'
    }
  ]

  const values = [
    {
      title: 'Innovation First',
      description: 'We push boundaries and embrace new ideas to create groundbreaking solutions.',
      icon: '🚀'
    },
    {
      title: 'Human Connection',
      description: 'Technology serves humanity - we build tools that bring people together.',
      icon: '🤝'
    },
    {
      title: 'Cultural Diversity',
      description: 'We celebrate different perspectives and global experiences.',
      icon: '🌍'
    },
    {
      title: 'Continuous Learning',
      description: 'Growth mindset drives everything we do - learn, adapt, and excel.',
      icon: '📚'
    }
  ]

  const benefits = [
    {
      icon: TrophyIcon,
      title: 'Competitive Compensation',
      description: 'Market-leading salaries and equity participation'
    },
    {
      icon: ClockIcon,
      title: 'Flexible Work Environment',
      description: 'Work-life balance with flexible schedules and a supportive, collaborative workplace culture'
    },
    {
      icon: HeartIcon,
      title: 'Health & Wellness',
      description: 'Comprehensive health coverage and wellness programs'
    },
    {
      icon: SparklesIcon,
      title: 'Grow With Us',
      description: 'Invest in yourself in us and watch your career flourish with our comprehensive learning programs, mentorship opportunities, and skill development initiatives'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-850 via-bg-900 to-bg-850">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/')}
            className="btn-secondary hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-6xl font-bold text-text-high mb-6"
          >
            Why Work at <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="text-primary-400"
            >Amealio</motion.span>?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="text-2xl text-text-mid max-w-4xl mx-auto mb-8"
          >
            Join a mission-driven team that&apos;s revolutionizing how people connect through food, technology, and shared experiences.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.05, transition: { duration: 0.15, ease: "easeOut" } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              <Button
                onClick={() => router.push('/jobs')}
                className="btn-primary text-lg px-8 py-4 hover:shadow-lg transition-all duration-300"
              >
                View Open Positions
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05, transition: { duration: 0.15, ease: "easeOut" } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              <Button
                onClick={() => router.push('/culture')}
                className="btn-secondary text-lg px-8 py-4 hover:shadow-lg transition-all duration-300"
              >
                Meet Our Team
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Mission Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="mb-20"
        >
          {/* Purple Hero Background */}
          <motion.div 
            className="relative bg-hero-gradient rounded-3xl p-1 shadow-2xl"
            whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-hero-gradient rounded-3xl p-12 text-white text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="text-4xl font-bold text-white mb-6"
              >
                Our Mission
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="text-xl leading-relaxed max-w-4xl mx-auto mb-8 text-white"
              >
                We&apos;re building a future where AI-powered personalization meets genuine human connection — helping people find the perfect dish, place, or moment, and making every experience more meaningful.
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <div className="text-4xl font-bold mb-2 text-white">70+</div>
                  <div className="text-lg text-white">Countries Explored</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <div className="text-4xl font-bold mb-2 text-white">25+</div>
                  <div className="text-lg text-white">Years Experience</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <div className="text-4xl font-bold mb-2 text-white">∞</div>
                  <div className="text-lg text-white">Possibilities</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Why Join Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-bold text-text-high text-center mb-12"
          >
            Why You&apos;ll Love Working Here
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
                className="bg-bg-800 rounded-2xl p-8 border border-border hover:border-primary-400 transition-all duration-300 hover:scale-105"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-50">
                  <perk.icon className={`w-8 h-8 ${perk.color}`} />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-4">
                  {perk.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {perk.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          className="mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-bold text-text-high text-center mb-12"
          >
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
                className="text-center"
                whileHover={{ 
                  scale: 1.1,
                  y: -10,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              >
                <motion.div 
                  className="text-6xl mb-4"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  {value.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-text-high mb-3">
                  {value.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          className="mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-bold text-text-high text-center mb-12"
          >
            What We Offer
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
                className="bg-gradient-to-br from-bg-800 to-bg-900 rounded-2xl p-8 border border-border text-center"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-100">
                  <benefit.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-text-high mb-4">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Founders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          className="mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-bold text-text-high text-center mb-12"
          >
            Meet Our Leadership
          </motion.h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Founder 1 - Shaker Dixit */}
            <motion.div 
              className="bg-gradient-to-br from-bg-800 to-bg-900 rounded-3xl p-8 border border-border"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.15, ease: "easeOut" }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-text-high mb-2">
                    Shaker Dixit
                  </h3>
                  <p className="text-lg font-semibold text-primary-400 mb-6">
                    Founder, CEO, CPO & CTO
                  </p>
                  <div className="space-y-4 text-text-secondary mb-6">
                    <p className="text-sm leading-relaxed">
                      &quot;With 25 years in technology and travels to 70+ countries, I&apos;ve seen how food brings people together across cultures. At amealio, we&apos;re not just building an app – we&apos;re creating bridges between technology and human connection.&quot;
                    </p>
                    <p className="text-sm leading-relaxed">
                      &quot;Every meal becomes more than food – it becomes an experience worth remembering.&quot;
                    </p>
                  </div>
                  <Link
                    href="https://www.linkedin.com/in/shaker-dixit12345/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </Link>
                </div>
                <div className="relative">
                  <div className="bg-hero-gradient rounded-2xl p-8 text-white h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlayIcon className="w-6 h-6" />
                      </div>
                      <p className="text-lg font-medium">Founder Message</p>
                      <p className="text-sm opacity-80">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Founder 2 - Raghav */}
            <motion.div 
              className="bg-gradient-to-br from-bg-800 to-bg-900 rounded-3xl p-8 border border-border"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.02,
                y: -5,
                transition: { duration: 0.15, ease: "easeOut" }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-text-high mb-2">
                    Raghav Mamidipalli
                  </h3>
                  <p className="text-lg font-semibold text-primary-400 mb-6">
                    Co-founder & Head of HR&M, Accounting
                  </p>
                  <div className="space-y-4 text-text-secondary mb-6">
                    <p className="text-sm leading-relaxed">
                      &quot;Building a strong, passionate team is at the heart of everything we do. We&apos;re creating an AI-powered platform that connects people through food, joy, and community.&quot;
                    </p>
                    <p className="text-sm leading-relaxed">
                      &quot;If you&apos;re inspired to be part of a mission where every meal becomes a memory, we&apos;d love to hear from you.&quot;
                    </p>
                  </div>
                  <Link
                    href="https://www.linkedin.com/in/raghav-mamidipalli/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </Link>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-8 text-white h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlayIcon className="w-6 h-6" />
                      </div>
                      <p className="text-lg font-medium">Founder Message</p>
                      <p className="text-sm opacity-80">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          {/* Purple Hero Background */}
          <motion.div 
            className="relative bg-hero-gradient rounded-3xl p-1 shadow-2xl"
            whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-hero-gradient rounded-3xl p-12 text-white">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="text-3xl font-bold text-white mb-6"
              >
                Ready to Make an Impact?
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="text-xl mb-8 max-w-2xl mx-auto text-white"
              >
                Join us in building the future of food experiences. Your journey starts here.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                >
                  <Button
                    onClick={() => router.push('/jobs')}
                    className="bg-white text-purple-500 hover:bg-purple-500 hover:text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Explore Opportunities
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                >
                  <Button
                    onClick={() => router.push('/register')}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-500 text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    Join Our Community
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
