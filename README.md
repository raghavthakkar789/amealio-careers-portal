<<<<<<< HEAD
# amealio-careers-portal
Carrers Page
=======
# amealio Careers Portal

A comprehensive careers portal for amealio with role-based access, complete CRUD operations, and modern design system.

## 🚀 Features

### User Roles & Access Levels
- **Job Applicant**: Apply for positions, track applications, manage profile
- **HR Manager**: Create jobs, review applications, schedule interviews, manage candidates
- **Admin**: Complete system oversight, final hiring decisions, analytics

### Core Functionality
- ✅ User registration and authentication
- ✅ Job posting and management
- ✅ Application submission with file uploads
- ✅ Interview scheduling and management
- ✅ Application status tracking
- ✅ Email notifications
- ✅ Role-based dashboards
- ✅ Responsive design
- ✅ Modern UI/UX

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Node.js with Express.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom design system
- **File Upload**: AWS S3 integration
- **Email**: Nodemailer with templates
- **State Management**: React Context
- **Form Handling**: React Hook Form with validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- AWS S3 bucket (for file uploads)
- SMTP email service

## 🚀 Quick Start

###
 1. Clone the repository
```bash
git clone <repository-url>
cd amealio-careers-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment example file and configure your variables:
```bash
cp env.example .env.local
```

Update the `.env.local` file with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/amealio_careers"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="amealio-careers"

# JWT Secret
JWT_SECRET="your-jwt-secret-here"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="pdf,doc,docx"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 👥 Demo Accounts

The seed script creates demo accounts for testing:

- **Admin**: admin@amealio.com / admin123
- **HR Manager**: hr@amealio.com / hr123  
- **Applicant**: user@amealio.com / user123

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── login/            # Authentication pages
│   ├── register/         # Registration page
│   ├── dashboard/        # User dashboards
│   ├── hr/              # HR dashboard
│   ├── admin/           # Admin dashboard
│   └── jobs/            # Job-related pages
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   ├── sections/        # Page sections
│   ├── cards/           # Card components
│   └── forms/           # Form components
├── lib/                 # Utility libraries
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## 🎨 Design System

The application uses a custom design system with:

- **Colors**: Primary purple gradient (#3D1E94 to #7B3EF0)
- **Typography**: Mulish font family
- **Components**: Consistent button, card, and form styles
- **Responsive**: Mobile-first design approach

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CSRF protection
- Rate limiting on API endpoints

## 📧 Email System

Automated email notifications for:
- Application submission confirmation
- Application status updates
- Interview scheduling
- Interview reminders
- Acceptance/rejection notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
1. Build the application: `npm run build`
2. Set up environment variables
3. Configure database connection
4. Deploy the `out` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email careers@amealio.com or create an issue in the repository.

---

Built with ❤️ by the amealio Team
>>>>>>> 2d3190b (Initial Commit)
