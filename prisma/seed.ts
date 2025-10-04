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

  // Create additional Admin user
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@amealio.com' },
    update: {},
    create: {
      email: 'admin2@amealio.com',
      password: hashedPassword,
      firstName: 'Suresh',
      lastName: 'Patel',
      role: 'ADMIN',
      dateOfBirth: new Date('1988-03-15'),
      phoneNumber: '+91 98765 43213',
      countryCode: '+91',
      address: '456 Park Street, Kolkata, West Bengal 700016',
    },
  })

  // Create additional HR users
  const hr2 = await prisma.user.upsert({
    where: { email: 'hr2@amealio.com' },
    update: {},
    create: {
      email: 'hr2@amealio.com',
      password: hrPassword,
      firstName: 'Deepak',
      lastName: 'Verma',
      role: 'HR',
      dateOfBirth: new Date('1987-07-22'),
      phoneNumber: '+91 98765 43214',
      countryCode: '+91',
      address: '789 MG Road, Pune, Maharashtra 411001',
    },
  })

  const hr3 = await prisma.user.upsert({
    where: { email: 'hr3@amealio.com' },
    update: {},
    create: {
      email: 'hr3@amealio.com',
      password: hrPassword,
      firstName: 'Anita',
      lastName: 'Reddy',
      role: 'HR',
      dateOfBirth: new Date('1989-11-08'),
      phoneNumber: '+91 98765 43215',
      countryCode: '+91',
      address: '321 Brigade Road, Chennai, Tamil Nadu 600001',
    },
  })

  // Create additional Applicant users
  const applicant2 = await prisma.user.upsert({
    where: { email: 'applicant2@amealio.com' },
    update: {},
    create: {
      email: 'applicant2@amealio.com',
      password: userPassword,
      firstName: 'Rahul',
      lastName: 'Gupta',
      role: 'APPLICANT',
      dateOfBirth: new Date('1992-04-12'),
      phoneNumber: '+91 98765 43216',
      countryCode: '+91',
      address: '654 Indira Nagar, Hyderabad, Telangana 500001',
    },
  })

  const applicant3 = await prisma.user.upsert({
    where: { email: 'applicant3@amealio.com' },
    update: {},
    create: {
      email: 'applicant3@amealio.com',
      password: userPassword,
      firstName: 'Priya',
      lastName: 'Joshi',
      role: 'APPLICANT',
      dateOfBirth: new Date('1994-09-25'),
      phoneNumber: '+91 98765 43217',
      countryCode: '+91',
      address: '987 Sector 17, Chandigarh, Punjab 160017',
    },
  })

  const applicant4 = await prisma.user.upsert({
    where: { email: 'applicant4@amealio.com' },
    update: {},
    create: {
      email: 'applicant4@amealio.com',
      password: userPassword,
      firstName: 'Vikram',
      lastName: 'Malhotra',
      role: 'APPLICANT',
      dateOfBirth: new Date('1991-12-03'),
      phoneNumber: '+91 98765 43218',
      countryCode: '+91',
      address: '147 Salt Lake, Kolkata, West Bengal 700064',
    },
  })

  const applicant5 = await prisma.user.upsert({
    where: { email: 'applicant5@amealio.com' },
    update: {},
    create: {
      email: 'applicant5@amealio.com',
      password: userPassword,
      firstName: 'Sneha',
      lastName: 'Agarwal',
      role: 'APPLICANT',
      dateOfBirth: new Date('1993-06-18'),
      phoneNumber: '+91 98765 43219',
      countryCode: '+91',
      address: '258 Koramangala, Bangalore, Karnataka 560034',
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
    prisma.job.upsert({
      where: { id: 'job-4' },
      update: {},
      create: {
        id: 'job-4',
        title: 'Frontend Developer',
        departmentId: departments[0].id, // Engineering
        summary: 'Build beautiful and responsive user interfaces using modern web technologies.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
        isActive: true,
        isDraft: false,
        createdById: hr2.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-5' },
      update: {},
      create: {
        id: 'job-5',
        title: 'Backend Developer',
        departmentId: departments[0].id, // Engineering
        summary: 'Develop scalable backend services and APIs for our platform.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS'],
        isActive: true,
        isDraft: false,
        createdById: hr3.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-6' },
      update: {},
      create: {
        id: 'job-6',
        title: 'Marketing Specialist',
        departmentId: departments[1].id, // Marketing
        summary: 'Drive marketing campaigns and brand awareness initiatives.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics'],
        isActive: true,
        isDraft: false,
        createdById: hr2.id,
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-7' },
      update: {},
      create: {
        id: 'job-7',
        title: 'Business Analyst',
        departmentId: departments[4].id, // Finance
        summary: 'Analyze business processes and provide data-driven insights.',
        employmentTypes: ['FULL_TIME'],
        requiredSkills: ['Data Analysis', 'SQL', 'Excel', 'Business Intelligence'],
        isActive: true,
        isDraft: false,
        createdById: hr3.id,
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
    // Additional applications for applicant2 (Rahul Gupta)
    prisma.application.upsert({
      where: { id: 'app-3' },
      update: {},
      create: {
        id: 'app-3',
        jobTitle: 'Frontend Developer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume3.pdf',
        additionalFiles: ['https://example.com/portfolio3.pdf'],
        coverLetter: 'I am a passionate frontend developer with expertise in React and modern web technologies.',
        expectedSalary: '₹6,00,000 - ₹8,00,000',
        status: 'INTERVIEW_SCHEDULED',
        applicantId: applicant2.id,
        jobId: jobs[3].id, // Frontend Developer job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-4' },
      update: {},
      create: {
        id: 'app-4',
        jobTitle: 'Marketing Specialist',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume4.pdf',
        additionalFiles: [],
        coverLetter: 'I have experience in digital marketing and social media management.',
        expectedSalary: '₹5,00,000 - ₹7,00,000',
        status: 'ACCEPTED',
        applicantId: applicant2.id,
        jobId: jobs[5].id, // Marketing Specialist job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-5' },
      update: {},
      create: {
        id: 'app-5',
        jobTitle: 'Sales Representative',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume5.pdf',
        additionalFiles: [],
        coverLetter: 'I am excited about the sales opportunity and have strong communication skills.',
        expectedSalary: '₹4,00,000 - ₹6,00,000',
        status: 'REJECTED',
        applicantId: applicant2.id,
        jobId: jobs[2].id, // Sales Representative job
      },
    }),
    // Additional applications for applicant3 (Priya Joshi)
    prisma.application.upsert({
      where: { id: 'app-6' },
      update: {},
      create: {
        id: 'app-6',
        jobTitle: 'Backend Developer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume6.pdf',
        additionalFiles: ['https://example.com/portfolio6.pdf'],
        coverLetter: 'I specialize in backend development with Node.js and Python.',
        expectedSalary: '₹7,00,000 - ₹9,00,000',
        status: 'INTERVIEW_COMPLETED',
        applicantId: applicant3.id,
        jobId: jobs[4].id, // Backend Developer job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-7' },
      update: {},
      create: {
        id: 'app-7',
        jobTitle: 'Business Analyst',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume7.pdf',
        additionalFiles: [],
        coverLetter: 'I have strong analytical skills and experience in data analysis.',
        expectedSalary: '₹6,00,000 - ₹8,00,000',
        status: 'HIRED',
        applicantId: applicant3.id,
        jobId: jobs[6].id, // Business Analyst job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-8' },
      update: {},
      create: {
        id: 'app-8',
        jobTitle: 'Product Manager',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume8.pdf',
        additionalFiles: [],
        coverLetter: 'I am passionate about product management and user experience.',
        expectedSalary: '₹8,00,000 - ₹10,00,000',
        status: 'UNDER_REVIEW',
        applicantId: applicant3.id,
        jobId: jobs[1].id, // Product Manager job
      },
    }),
    // Additional applications for applicant4 (Vikram Malhotra)
    prisma.application.upsert({
      where: { id: 'app-9' },
      update: {},
      create: {
        id: 'app-9',
        jobTitle: 'Senior Software Engineer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume9.pdf',
        additionalFiles: ['https://example.com/portfolio9.pdf'],
        coverLetter: 'I am a senior software engineer with expertise in full-stack development.',
        expectedSalary: '₹9,00,000 - ₹12,00,000',
        status: 'PENDING',
        applicantId: applicant4.id,
        jobId: jobs[0].id, // Senior Software Engineer job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-10' },
      update: {},
      create: {
        id: 'app-10',
        jobTitle: 'Frontend Developer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume10.pdf',
        additionalFiles: [],
        coverLetter: 'I have strong frontend development skills and attention to detail.',
        expectedSalary: '₹5,50,000 - ₹7,50,000',
        status: 'INTERVIEW_SCHEDULED',
        applicantId: applicant4.id,
        jobId: jobs[3].id, // Frontend Developer job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-11' },
      update: {},
      create: {
        id: 'app-11',
        jobTitle: 'Backend Developer',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume11.pdf',
        additionalFiles: [],
        coverLetter: 'I am experienced in backend development and database design.',
        expectedSalary: '₹6,50,000 - ₹8,50,000',
        status: 'UNDER_REVIEW',
        applicantId: applicant4.id,
        jobId: jobs[4].id, // Backend Developer job
      },
    }),
    // Additional applications for applicant5 (Sneha Agarwal)
    prisma.application.upsert({
      where: { id: 'app-12' },
      update: {},
      create: {
        id: 'app-12',
        jobTitle: 'Marketing Specialist',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume12.pdf',
        additionalFiles: ['https://example.com/portfolio12.pdf'],
        coverLetter: 'I am creative and have experience in digital marketing campaigns.',
        expectedSalary: '₹4,50,000 - ₹6,50,000',
        status: 'PENDING',
        applicantId: applicant5.id,
        jobId: jobs[5].id, // Marketing Specialist job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-13' },
      update: {},
      create: {
        id: 'app-13',
        jobTitle: 'Business Analyst',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume13.pdf',
        additionalFiles: [],
        coverLetter: 'I have strong analytical and problem-solving skills.',
        expectedSalary: '₹5,50,000 - ₹7,50,000',
        status: 'INTERVIEW_COMPLETED',
        applicantId: applicant5.id,
        jobId: jobs[6].id, // Business Analyst job
      },
    }),
    prisma.application.upsert({
      where: { id: 'app-14' },
      update: {},
      create: {
        id: 'app-14',
        jobTitle: 'Sales Representative',
        employmentType: 'FULL_TIME',
        resumeUrl: 'https://example.com/resume14.pdf',
        additionalFiles: [],
        coverLetter: 'I am enthusiastic about sales and have excellent communication skills.',
        expectedSalary: '₹3,50,000 - ₹5,50,000',
        status: 'REJECTED',
        applicantId: applicant5.id,
        jobId: jobs[2].id, // Sales Representative job
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
  console.log('👥 Created users:', { 
    admin: admin.email, 
    admin2: admin2.email,
    hr: hr.email, 
    hr2: hr2.email,
    hr3: hr3.email,
    applicant: applicant.email,
    applicant2: applicant2.email,
    applicant3: applicant3.email,
    applicant4: applicant4.email,
    applicant5: applicant5.email
  })
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
