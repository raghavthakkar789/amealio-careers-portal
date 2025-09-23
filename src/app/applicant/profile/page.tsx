'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  currentPosition?: string
  company?: string
  experience?: string
  education?: string
  skills?: string[]
  bio?: string
  resumeUrl?: string
  resumeFile?: File
  resumeFileName?: string
  linkedinUrl?: string
  portfolioUrl?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [uploadingResume, setUploadingResume] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on role
    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (session.user?.role === 'HR') {
      router.push('/hr/dashboard')
    }

    // Mock data - replace with actual API call
    setTimeout(() => {
      setProfile({
        id: session.user?.id || '1',
        name: session.user?.name || 'John Doe',
        email: session.user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        currentPosition: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: '5+ years',
        education: 'Bachelor of Computer Science',
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
        bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. I love working with modern technologies and contributing to open source projects.',
        resumeUrl: '/resumes/john-doe-resume.pdf',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://johndoe.dev'
      })
      setFormData({
        name: session.user?.name || 'John Doe',
        email: session.user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        currentPosition: 'Senior Software Engineer',
        company: 'Tech Corp',
        experience: '5+ years',
        education: 'Bachelor of Computer Science',
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
        bio: 'Passionate software engineer with 5+ years of experience building scalable web applications. I love working with modern technologies and contributing to open source projects.',
        resumeUrl: '/resumes/john-doe-resume.pdf',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://johndoe.dev'
      })
      setLoading(false)
    }, 1000)
  }, [session, status, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setFormData(prev => ({
      ...prev,
      skills
    }))
  }

  const handleFileUpload = async (file: File) => {
    setUploadingResume(true)
    try {
      // Mock file upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setFormData(prev => ({
        ...prev,
        resumeFile: file,
        resumeFileName: file.name,
        resumeUrl: URL.createObjectURL(file) // Temporary URL for preview
      }))
      
      toast.success('Resume uploaded successfully!')
    } catch {
      toast.error('Failed to upload resume. Please try again.')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      handleFileUpload(file)
    }
  }

  const removeResume = () => {
    setFormData(prev => ({
      ...prev,
      resumeFile: undefined,
      resumeFileName: undefined,
      resumeUrl: undefined
    }))
    toast.success('Resume removed')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setProfile(prev => prev ? { ...prev, ...formData } : null)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-850">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-850">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                onClick={() => router.push('/applicant/dashboard')}
                variant="secondary"
                className="mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-bold text-text-high mb-2">
                My Profile
              </h1>
              <p className="text-text-mid">
                Manage your personal information and professional details
              </p>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    className="btn-secondary"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-high mb-2">
                    {isEditing ? (
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-center"
                      />
                    ) : (
                      profile.name
                    )}
                  </h2>
                  <p className="text-text-mid">
                    {isEditing ? (
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="text-center"
                      />
                    ) : (
                      profile.email
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                    <span className="text-text-mid">
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Phone number"
                        />
                      ) : (
                        profile.phone || 'Not provided'
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <span className="text-text-mid">
                      {isEditing ? (
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Location"
                        />
                      ) : (
                        profile.location || 'Not provided'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Information */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-primary" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Current Position
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.currentPosition || ''}
                        onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                        placeholder="Your current job title"
                      />
                    ) : (
                      <p className="text-text-high">{profile.currentPosition || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Company
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your current company"
                      />
                    ) : (
                      <p className="text-text-high">{profile.company || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Experience
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.experience || ''}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Years of experience"
                      />
                    ) : (
                      <p className="text-text-high">{profile.experience || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Education
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        placeholder="Your education background"
                      />
                    ) : (
                      <p className="text-text-high">{profile.education || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-primary" />
                  Skills
                </h3>
                
                {isEditing ? (
                  <Input
                    value={formData.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="Enter skills separated by commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-bg-800 text-text-mid text-sm rounded-md border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4">
                  About Me
                </h3>
                
                {isEditing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-border rounded-lg bg-bg-800 text-text-high focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-text-high leading-relaxed">
                    {profile.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-high mb-4">
                  Links & Documents
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      LinkedIn Profile
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.linkedinUrl || ''}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    ) : (
                      <p className="text-text-high">
                        {profile.linkedinUrl ? (
                          <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                          >
                            {profile.linkedinUrl}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Portfolio Website
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.portfolioUrl || ''}
                        onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <p className="text-text-high">
                        {profile.portfolioUrl ? (
                          <a 
                            href={profile.portfolioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-hover"
                          >
                            {profile.portfolioUrl}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-mid mb-2">
                      Resume
                    </label>
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* File Upload Area */}
                        <div className="relative">
                          <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploadingResume}
                          />
                          <label
                            htmlFor="resume-upload"
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              uploadingResume
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-bg-800'
                            }`}
                          >
                            {uploadingResume ? (
                              <div className="flex flex-col items-center">
                                <LoadingSpinner size="sm" />
                                <span className="text-sm text-text-mid mt-2">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <DocumentArrowUpIcon className="w-8 h-8 text-primary mb-2" />
                                <span className="text-sm text-text-mid">
                                  Click to upload resume
                                </span>
                                <span className="text-xs text-text-mid">
                                  PDF, DOC, DOCX (Max 5MB)
                                </span>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Current Resume Display */}
                        {(formData.resumeFileName || formData.resumeUrl) && (
                          <div className="flex items-center justify-between p-3 bg-bg-800 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-text-high">
                                  {formData.resumeFileName || 'Current Resume'}
                                </p>
                                {formData.resumeUrl && (
                                  <a
                                    href={formData.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-primary-hover"
                                  >
                                    View current resume
                                  </a>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={removeResume}
                              variant="secondary"
                              className="btn-secondary p-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {profile.resumeUrl ? (
                          <div className="flex items-center justify-between p-3 bg-bg-800 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium text-text-high">
                                  {profile.resumeFileName || 'Resume.pdf'}
                                </p>
                                <a 
                                  href={profile.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:text-primary-hover"
                                >
                                  View Resume
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-text-mid text-sm">No resume uploaded</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
