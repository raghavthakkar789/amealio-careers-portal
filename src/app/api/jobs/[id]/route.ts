import { NextRequest, NextResponse } from 'next/server'

// Mock job data with different details for each job
const mockJobs = {
  '1': {
    id: '1',
    title: 'Senior Software Engineer',
    department: 'ENGINEERING',
    location: 'Bangalore, India',
    remoteWork: true,
    employmentTypes: ['FULL_TIME'],
    applicationDeadline: '2024-12-31',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    summary: 'Join our engineering team to build scalable web applications.',
    description: 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
    requirements: [
      '5+ years of software development experience',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with PostgreSQL and MongoDB',
      'Strong problem-solving skills',
      'Excellent communication skills',
      'Experience with cloud platforms (AWS/Azure)',
      'Knowledge of CI/CD pipelines'
    ],
    responsibilities: [
      'Design and develop scalable web applications',
      'Collaborate with cross-functional teams',
      'Mentor junior developers',
      'Participate in code reviews',
      'Contribute to architectural decisions',
      'Optimize application performance',
      'Implement security best practices'
    ],
    benefits: [
      'Competitive salary package (₹15-25 LPA)',
      'Health insurance coverage',
      'Flexible working hours',
      'Remote work options',
      'Professional development opportunities',
      'Stock options',
      'Annual team retreats'
    ],
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@amealio.com'
    }
  },
  '2': {
    id: '2',
    title: 'Product Manager',
    department: 'MARKETING',
    location: 'Mumbai, India',
    remoteWork: false,
    employmentTypes: ['FULL_TIME'],
    applicationDeadline: '2024-12-25',
    requiredSkills: ['Product Strategy', 'Agile', 'User Research'],
    summary: 'Lead product development and strategy for our platform.',
    description: 'As a Product Manager, you will lead product development and strategy for our platform. You will work closely with cross-functional teams to deliver exceptional user experiences.',
    requirements: [
      '3+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience with Agile methodologies',
      'Excellent communication and leadership skills',
      'Background in technology or SaaS products',
      'Experience with user research and analytics',
      'MBA or equivalent experience preferred'
    ],
    responsibilities: [
      'Define product strategy and roadmap',
      'Collaborate with engineering and design teams',
      'Conduct user research and market analysis',
      'Manage product backlog and prioritization',
      'Coordinate product launches',
      'Analyze product metrics and KPIs',
      'Work with stakeholders across the organization'
    ],
    benefits: [
      'Competitive salary package (₹12-20 LPA)',
      'Health and dental insurance',
      'Flexible working arrangements',
      'Professional development budget',
      'Performance bonuses',
      'Equity participation',
      'Learning and development opportunities'
    ],
    createdAt: '2024-01-14T10:00:00Z',
    createdBy: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@amealio.com'
    }
  },
  '3': {
    id: '3',
    title: 'Sales Representative',
    department: 'SALES',
    location: 'Delhi, India',
    remoteWork: false,
    employmentTypes: ['FULL_TIME', 'PART_TIME'],
    applicationDeadline: '2024-12-20',
    requiredSkills: ['Sales', 'CRM', 'Communication'],
    summary: 'Drive revenue growth through strategic sales initiatives.',
    description: 'Drive revenue growth through strategic sales initiatives. You will be responsible for building relationships with clients and achieving sales targets.',
    requirements: [
      '2+ years of sales experience',
      'Proven track record of meeting sales targets',
      'Excellent communication and negotiation skills',
      'Experience with CRM systems',
      'Strong networking abilities',
      'Bachelor\'s degree in Business or related field',
      'Experience in B2B sales preferred'
    ],
    responsibilities: [
      'Identify and prospect new business opportunities',
      'Build and maintain client relationships',
      'Conduct product demonstrations',
      'Negotiate contracts and pricing',
      'Meet and exceed sales targets',
      'Collaborate with marketing team',
      'Provide regular sales reports and forecasts'
    ],
    benefits: [
      'Competitive base salary + commission',
      'Health insurance coverage',
      'Sales performance bonuses',
      'Company car or transportation allowance',
      'Professional development opportunities',
      'Team building activities',
      'Flexible work schedule'
    ],
    createdAt: '2024-01-13T10:00:00Z',
    createdBy: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@amealio.com'
    }
  },
  '4': {
    id: '4',
    title: 'UX Designer',
    department: 'MARKETING',
    location: 'Hyderabad, India',
    remoteWork: true,
    employmentTypes: ['FULL_TIME'],
    applicationDeadline: '2024-12-28',
    requiredSkills: ['Figma', 'User Research', 'Prototyping'],
    summary: 'Create exceptional user experiences for our products.',
    description: 'Create exceptional user experiences for our products. You will work closely with product managers and developers to design intuitive and engaging user interfaces.',
    requirements: [
      '3+ years of UX/UI design experience',
      'Proficiency in Figma, Sketch, or Adobe XD',
      'Strong portfolio showcasing user-centered design',
      'Experience with user research methodologies',
      'Knowledge of design systems and accessibility',
      'Understanding of front-end development',
      'Bachelor\'s degree in Design or related field'
    ],
    responsibilities: [
      'Design user interfaces and experiences',
      'Conduct user research and usability testing',
      'Create wireframes, prototypes, and mockups',
      'Collaborate with product and engineering teams',
      'Develop and maintain design systems',
      'Present design concepts to stakeholders',
      'Iterate on designs based on feedback'
    ],
    benefits: [
      'Competitive salary package (₹8-15 LPA)',
      'Health and wellness benefits',
      'Remote work flexibility',
      'Design tools and software licenses',
      'Conference and training budget',
      'Creative work environment',
      'Opportunity to work on diverse projects'
    ],
    createdAt: '2024-01-12T10:00:00Z',
    createdBy: {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@amealio.com'
    }
  },
  '5': {
    id: '5',
    title: 'Data Scientist',
    department: 'ENGINEERING',
    location: 'Pune, India',
    remoteWork: false,
    employmentTypes: ['FULL_TIME'],
    applicationDeadline: '2024-12-30',
    requiredSkills: ['Python', 'Machine Learning', 'SQL'],
    summary: 'Build data-driven solutions and insights.',
    description: 'Build data-driven solutions and insights. You will work with large datasets to extract meaningful insights and build machine learning models.',
    requirements: [
      '4+ years of data science experience',
      'Strong programming skills in Python/R',
      'Experience with machine learning algorithms',
      'Proficiency in SQL and database systems',
      'Knowledge of statistical analysis',
      'Experience with data visualization tools',
      'Master\'s degree in Data Science or related field'
    ],
    responsibilities: [
      'Analyze large datasets to extract insights',
      'Build and deploy machine learning models',
      'Develop data pipelines and ETL processes',
      'Create data visualizations and reports',
      'Collaborate with engineering and product teams',
      'Present findings to stakeholders',
      'Stay updated with latest data science trends'
    ],
    benefits: [
      'Competitive salary package (₹18-30 LPA)',
      'Health and dental insurance',
      'Professional development opportunities',
      'Access to latest tools and technologies',
      'Conference and training budget',
      'Flexible working hours',
      'Stock options program'
    ],
    createdAt: '2024-01-11T10:00:00Z',
    createdBy: {
      firstName: 'Lisa',
      lastName: 'Wang',
      email: 'lisa.wang@amealio.com'
    }
  },
  '6': {
    id: '6',
    title: 'HR Coordinator',
    department: 'HR',
    location: 'Chennai, India',
    remoteWork: true,
    employmentTypes: ['FULL_TIME'],
    applicationDeadline: '2024-12-22',
    requiredSkills: ['HRIS', 'Recruitment', 'Employee Relations'],
    summary: 'Support our HR operations and employee experience.',
    description: 'Support our HR operations and employee experience. You will assist in recruitment, employee relations, and various HR administrative tasks.',
    requirements: [
      '2+ years of HR experience',
      'Knowledge of HR policies and procedures',
      'Experience with HRIS systems',
      'Strong interpersonal and communication skills',
      'Attention to detail and organizational skills',
      'Bachelor\'s degree in HR or related field',
      'Certification in HR preferred'
    ],
    responsibilities: [
      'Assist in recruitment and onboarding processes',
      'Maintain employee records and HRIS',
      'Support employee relations activities',
      'Coordinate training and development programs',
      'Handle HR administrative tasks',
      'Assist with performance management',
      'Ensure compliance with labor laws'
    ],
    benefits: [
      'Competitive salary package (₹6-10 LPA)',
      'Health insurance coverage',
      'Remote work options',
      'Professional development opportunities',
      'Employee assistance program',
      'Flexible working hours',
      'Annual performance bonuses'
    ],
    createdAt: '2024-01-10T10:00:00Z',
    createdBy: {
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.brown@amealio.com'
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const job = mockJobs[jobId as keyof typeof mockJobs]

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job, { status: 200 })

  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
