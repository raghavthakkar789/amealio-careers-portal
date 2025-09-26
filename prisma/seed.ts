import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const hrPassword = await bcrypt.hash('hr123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@amealio.com' },
    update: {},
    create: {
      email: 'admin@amealio.com',
      password: hashedPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: 'ADMIN',
      // emailVerified: new Date(), // Commented out email verification
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '+91 98765 43210',
      address: '123 MG Road, Mumbai, Maharashtra 400001',
    },
  })

  // Create HR user
  const hr = await prisma.user.upsert({
    where: { email: 'hr@amealio.com' },
    update: {},
    create: {
      email: 'hr@amealio.com',
      password: hrPassword,
      firstName: 'Priya',
      lastName: 'Singh',
      role: 'HR',
      // emailVerified: new Date(), // Commented out email verification
      dateOfBirth: new Date('1985-05-15'),
      phoneNumber: '+91 98765 43211',
      address: '456 Brigade Road, Bangalore, Karnataka 560001',
    },
  })

  // Create Applicant user
  const applicant = await prisma.user.upsert({
    where: { email: 'user@amealio.com' },
    update: {},
    create: {
      email: 'user@amealio.com',
      password: userPassword,
      firstName: 'Arjun',
      lastName: 'Sharma',
      role: 'APPLICANT',
      // emailVerified: new Date(), // Commented out email verification
      dateOfBirth: new Date('1995-08-20'),
      phoneNumber: '+91 98765 43212',
      address: '789 Connaught Place, New Delhi, Delhi 110001',
    },
  })

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Software development and technical roles',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        description: 'Marketing and product management roles',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Sales' },
      update: {},
      create: {
        name: 'Sales',
        description: 'Sales and business development roles',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { name: 'HR' },
      update: {},
      create: {
        name: 'HR',
        description: 'Human resources and people operations',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        description: 'Financial planning and accounting roles',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: {
        name: 'Operations',
        description: 'Operations and administrative roles',
        isActive: true,
      },
    }),
  ])

  // Create demo jobs
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-1' },
      update: {},
      create: {
        id: 'job-1',
        title: 'Senior Software Engineer',
        departmentId: departments[0].id, // Engineering
        summary: 'Join our engineering team to build scalable web applications.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        isActive: true,
        isDraft: false,
        createdById: hr.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-2' },
      update: {},
      create: {
        id: 'job-2',
        title: 'Product Manager',
        departmentId: departments[1].id, // Marketing
        summary: 'Lead product development and strategy for our platform.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
        isActive: true,
        isDraft: false,
        createdById: hr.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-3' },
      update: {},
      create: {
        id: 'job-3',
        title: 'Sales Representative',
        departmentId: departments[2].id, // Sales
        summary: 'Drive revenue growth through strategic sales initiatives.',
        employmentTypes: ['FULL_TIME', 'PART_TIME'],
        requiredSkills: ['Sales', 'CRM', 'Communication', 'Negotiation'],
        isActive: true,
        isDraft: false,
        createdById: hr.id,
      },
    }),
  ])

  // Create demo applications
  const applications = await Promise.all([
    prisma.application.upsert({
      where: { id: 'app-1' },
      update: {},
      create: {
        id: 'app-1',
        jobTitle: 'Senior Software Engineer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume1.pdf',
        additionalFiles: ['https://example.com/portfolio1.pdf'],
        coverLetter: 'I am excited to apply for the Senior Software Engineer position at amealio. With 5+ years of experience in full-stack development, I believe I would be a great fit for your team.',
        expectedSalary: '₹8,00,000 - ₹10,00,000',
        status: 'PENDING',
        applicantId: applicant.id,
        jobId: jobs[0].id,
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-2' },
      update: {},
      create: {
        id: 'app-2',
        jobTitle: 'Product Manager',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume2.pdf',
        additionalFiles: [],
        coverLetter: 'I am passionate about product management and would love to contribute to amealio\'s mission of building innovative solutions.',
        expectedSalary: '₹9,00,000 - ₹12,00,000',
        status: 'UNDER_REVIEW',
        applicantId: applicant.id,
        jobId: jobs[1].id,
      },
    }),
  ])

  // Create demo interviews
  const interviews = await Promise.all([
    prisma.interview.upsert({
      where: { id: 'interview-1' },
      update: {},
      create: {
        id: 'interview-1',
        scheduledAt: new Date('2024-02-15T10:00:00Z'),
        interviewType: 'VIDEO',
        meetingLink: 'https://zoom.us/j/123456789',
        status: 'SCHEDULED',
        notes: 'Technical interview focusing on React and Node.js skills',
        applicationId: applications[0].id,
        candidateId: applicant.id,
      },
    }),
  ])

  // Create demo interview reviews
  await Promise.all([
    prisma.interviewReview.upsert({
      where: { id: 'review-1' },
      update: {},
      create: {
        id: 'review-1',
        technicalSkills: 4,
        communication: 5,
        culturalFit: 4,
        overallRating: 4,
        comments: 'Strong technical skills and excellent communication. Would recommend moving forward.',
        recommendation: 'Proceed',
        interviewId: interviews[0].id,
        hrReviewerId: hr.id,
      },
    }),
  ])

  // Create demo notifications
  await Promise.all([
    prisma.notification.upsert({
      where: { id: 'notif-1' },
      update: {},
      create: {
        id: 'notif-1',
        title: 'Application Received',
        message: 'Your application for Senior Software Engineer has been received and is under review.',
        type: 'email',
        isRead: false,
        userId: applicant.id,
        applicationId: applications[0].id,
      },
    }),
    prisma.notification.upsert({
      where: { id: 'notif-2' },
      update: {},
      create: {
        id: 'notif-2',
        title: 'Interview Scheduled',
        message: 'Your interview for Senior Software Engineer has been scheduled for February 15th, 2024.',
        type: 'email',
        isRead: false,
        userId: applicant.id,
        interviewId: interviews[0].id,
      },
    }),
  ])

  // Create email templates
  await Promise.all([
    prisma.emailTemplate.upsert({
      where: { name: 'application_received' },
      update: {},
      create: {
        name: 'application_received',
        subject: 'Application Received - amealio Careers',
        body: 'Dear {{applicantName}},\n\nThank you for your application for the {{jobTitle}} position at amealio. We have received your application and it is currently under review.\n\nWe will contact you within 5-7 business days with next steps.\n\nBest regards,\nAmealio HR Team',
        variables: ['applicantName', 'jobTitle'],
        isActive: true,
      },
    }),
    prisma.emailTemplate.upsert({
      where: { name: 'interview_scheduled' },
      update: {},
      create: {
        name: 'interview_scheduled',
        subject: 'Interview Scheduled - amealio Careers',
        body: 'Dear {{applicantName}},\n\nYour interview for the {{jobTitle}} position has been scheduled for {{interviewDate}} at {{interviewTime}}.\n\nMeeting Link: {{meetingLink}}\n\nPlease prepare for the interview and let us know if you need to reschedule.\n\nBest regards,\nAmealio HR Team',
        variables: ['applicantName', 'jobTitle', 'interviewDate', 'interviewTime', 'meetingLink'],
        isActive: true,
      },
    }),
  ])

  // Create system settings
  await Promise.all([
    prisma.systemSetting.upsert({
      where: { key: 'max_file_size' },
      update: {},
      create: {
        key: 'max_file_size',
        value: '5242880',
        description: 'Maximum file size in bytes (5MB)',
      },
    }),
    prisma.systemSetting.upsert({
      where: { key: 'allowed_file_types' },
      update: {},
      create: {
        key: 'allowed_file_types',
        value: '*',
        description: 'Allowed file types for uploads (all types)',
      },
    }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log('👥 Created users:', { admin: admin.email, hr: hr.email, applicant: applicant.email })
  console.log('🏢 Created departments:', departments.length)
  console.log('💼 Created jobs:', jobs.length)
  console.log('📝 Created applications:', applications.length)
  console.log('📅 Created interviews:', interviews.length)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
