'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <h3 className="text-2xl font-bold mb-4">amealio</h3>
            <p className="text-purple-100 mb-6 leading-relaxed">
              Building the future through innovative technology and exceptional talent. 
              Join our mission to create solutions that make a difference.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => window.open('/jobs', '_blank')}
                className="btn-primary bg-white text-primary hover:bg-purple-50 hover:text-primary-hover"
              >
                Browse Jobs
              </Button>
              <Button
                onClick={() => window.open('/contact', '_blank')}
                variant="outline"
                className="btn-secondary border-white/30 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                Contact Us
              </Button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/jobs" className="text-purple-200 hover:text-white transition-colors">
                  Open Positions
                </a>
              </li>
              <li>
                <a href="/about" className="text-purple-200 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/culture" className="text-purple-200 hover:text-white transition-colors">
                  Company Culture
                </a>
              </li>
              <li>
                <a href="/benefits" className="text-purple-200 hover:text-white transition-colors">
                  Benefits & Perks
                </a>
              </li>
              <li>
                <a href="/faq" className="text-purple-200 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200">careers@amealio.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200">San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200">www.amealio.com</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-purple-300/30 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-purple-200 text-sm mb-4 md:mb-0">
              © 2024 amealio. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-purple-200 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-purple-200 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-purple-200 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
