# 📁 **amealio Careers Portal - Complete Structure & Functionality Guide**

## 🎨 **Color Scheme Reference**
- **Primary Brand Color**: `#40299B` (Deep Purple)
- **Primary Hover**: `#3A2588` (Darker Purple)
- **Hero Background**: `#050F33` (Dark Navy)
- **Text High**: `#1E293B` (Dark Gray)
- **Text Mid**: `#475569` (Medium Gray)
- **Text Dim**: `#64748B` (Light Gray)
- **Background 900**: `#FFFFFF` (White)
- **Background 850**: `#F8FAFC` (Light Gray)
- **Background 800**: `#FFFFFF` (White Cards)
- **Border**: `#E2E8F0` (Light Border)

---

## 📂 **Complete Folder Structure**

```
amealio-careers-portal/
├── 📁 src/
│   ├── 📁 app/                          # Next.js App Router Pages
│   │   ├── 📁 admin/                    # Admin-specific pages
│   │   │   ├── 📁 admin-management/     # Admin user management
│   │   │   │   └── 📄 page.tsx         # Admin management interface
│   │   │   ├── 📁 applications/         # Admin applications view
│   │   │   │   └── 📄 page.tsx         # Applications management
│   │   │   ├── 📁 dashboard/           # Admin dashboard
│   │   │   │   └── 📄 page.tsx         # Main admin dashboard
│   │   │   ├── 📁 hr-management/       # HR user management
│   │   │   │   └── 📄 page.tsx         # HR management interface
│   │   │   └── 📁 oversight/           # Admin oversight panel
│   │   │       └── 📄 page.tsx         # Complete oversight dashboard
│   │   ├── 📁 api/                     # API Routes
│   │   │   ├── 📁 admin/               # Admin API endpoints
│   │   │   │   ├── 📁 admins/          # Admin user APIs
│   │   │   │   │   ├── 📁 [id]/        # Individual admin APIs
│   │   │   │   │   │   └── 📄 route.ts # Admin CRUD operations
│   │   │   │   │   └── 📄 route.ts     # Admin list operations
│   │   │   │   ├── 📁 create-hr/       # HR creation API
│   │   │   │   │   └── 📄 route.ts     # Create HR user endpoint
│   │   │   │   ├── 📁 hr-performance/  # HR performance API
│   │   │   │   │   └── 📄 route.ts     # HR metrics endpoint
│   │   │   │   └── 📁 hr-users/        # HR user management APIs
│   │   │   │       ├── 📁 [id]/        # Individual HR APIs
│   │   │   │       │   ├── 📁 password/ # Password management
│   │   │   │       │   │   └── 📄 route.ts # Password reset
│   │   │   │       │   └── 📄 route.ts # HR user CRUD
│   │   │   │       └── 📄 route.ts     # HR users list
│   │   │   ├── 📁 applications/        # Application APIs
│   │   │   │   ├── 📁 [id]/            # Individual application APIs
│   │   │   │   │   ├── 📁 applicant/   # Applicant details API
│   │   │   │   │   │   └── 📄 route.ts # Get applicant details
│   │   │   │   │   └── 📄 route.ts     # Application CRUD
│   │   │   │   └── 📄 route.ts         # Applications list
│   │   │   ├── 📁 auth/                # Authentication APIs
│   │   │   │   ├── 📁 [...nextauth]/   # NextAuth configuration
│   │   │   │   │   └── 📄 route.ts     # Auth endpoints
│   │   │   │   ├── 📁 check-email/     # Email validation
│   │   │   │   │   └── 📄 route.ts     # Check email exists
│   │   │   │   └── 📁 register/        # User registration
│   │   │   │       └── 📄 route.ts     # Register new user
│   │   │   ├── 📁 departments/         # Department APIs
│   │   │   │   ├── 📁 [id]/            # Individual department
│   │   │   │   │   └── 📄 route.ts     # Department CRUD
│   │   │   │   └── 📄 route.ts         # Departments list
│   │   │   ├── 📁 files/               # File management APIs
│   │   │   │   └── 📁 [fileId]/        # Individual file APIs
│   │   │   │       └── 📄 route.ts     # File upload/download
│   │   │   ├── 📁 hr-requests/         # HR request APIs
│   │   │   │   ├── 📁 [id]/            # Individual request
│   │   │   │   │   └── 📄 route.ts     # Request management
│   │   │   │   └── 📄 route.ts         # Requests list
│   │   │   ├── 📁 interviews/          # Interview APIs
│   │   │   │   ├── 📁 [id]/            # Individual interview
│   │   │   │   │   └── 📁 evaluation/  # Interview evaluation
│   │   │   │   │       └── 📄 route.ts # Submit evaluation
│   │   │   │   └── 📄 route.ts         # Interviews list
│   │   │   ├── 📁 jobs/                # Job APIs
│   │   │   │   ├── 📁 [id]/            # Individual job
│   │   │   │   │   └── 📄 route.ts     # Job CRUD
│   │   │   │   └── 📄 route.ts         # Jobs list
│   │   │   ├── 📁 notifications/       # Notification APIs
│   │   │   │   ├── 📁 [id]/            # Individual notification
│   │   │   │   │   └── 📄 route.ts     # Notification management
│   │   │   │   └── 📄 route.ts         # Notifications list
│   │   │   └── 📁 user/                # User APIs
│   │   │       └── 📁 profile/         # User profile
│   │   │           └── 📄 route.ts     # Profile management
│   │   ├── 📁 applicant/               # Applicant-specific pages
│   │   │   ├── 📁 activity/            # Applicant activity
│   │   │   │   └── 📄 page.tsx         # Activity timeline
│   │   │   ├── 📁 applications/        # Applicant applications
│   │   │   │   └── 📄 page.tsx         # My applications
│   │   │   ├── 📁 dashboard/           # Applicant dashboard
│   │   │   │   └── 📄 page.tsx         # Main applicant dashboard
│   │   │   └── 📁 profile/             # Applicant profile
│   │   │       └── 📄 page.tsx         # Profile management
│   │   ├── 📁 culture/                 # Company culture page
│   │   │   └── 📄 page.tsx             # Culture showcase
│   │   ├── 📁 hr/                      # HR-specific pages
│   │   │   ├── 📁 analytics/           # HR analytics
│   │   │   │   └── 📄 page.tsx         # Analytics dashboard
│   │   │   ├── 📁 applications/        # HR applications view
│   │   │   │   └── 📄 page.tsx         # Applications management
│   │   │   ├── 📁 dashboard/           # HR dashboard
│   │   │   │   └── 📄 page.tsx         # Main HR dashboard
│   │   │   ├── 📁 interviews/          # Interview management
│   │   │   │   ├── 📁 [id]/            # Individual interview
│   │   │   │   │   └── 📁 evaluation/  # Interview evaluation
│   │   │   │   │       └── 📄 page.tsx # Evaluation form
│   │   │   │   └── 📄 page.tsx         # Interviews list
│   │   │   └── 📁 jobs/                # HR jobs management
│   │   │       └── 📄 page.tsx         # Jobs management
│   │   ├── 📁 jobs/                    # Job-related pages
│   │   │   ├── 📁 [id]/                # Individual job
│   │   │   │   ├── 📁 apply/           # Job application
│   │   │   │   │   └── 📄 page.tsx     # Application form
│   │   │   │   └── 📄 page.tsx         # Job details
│   │   │   └── 📄 page.tsx             # Jobs listing
│   │   ├── 📁 login/                   # Login page
│   │   │   └── 📄 page.tsx             # Authentication
│   │   ├── 📁 register/                # Registration page
│   │   │   └── 📄 page.tsx             # User registration
│   │   ├── 📄 layout.tsx               # Root layout
│   │   └── 📄 page.tsx                 # Home page
│   ├── 📁 components/                  # Reusable Components
│   │   ├── 📁 application/             # Application components
│   │   │   ├── 📄 ApplicantProfileModal.tsx # Profile modal
│   │   │   ├── 📄 ApplicationManagement.tsx # App management
│   │   │   └── 📄 FinalApprovalModal.tsx    # Final approval
│   │   ├── 📁 auth/                    # Authentication components
│   │   │   └── 📄 AuthGuard.tsx        # Route protection
│   │   ├── 📁 cards/                   # Card components
│   │   │   └── 📄 JobCard.tsx          # Job display card
│   │   ├── 📁 hr/                      # HR-specific components
│   │   │   └── 📄 DepartmentManagement.tsx # Department mgmt
│   │   ├── 📁 layout/                  # Layout components
│   │   │   └── 📄 Footer.tsx           # Site footer
│   │   ├── 📁 providers/               # Context providers
│   │   │   └── 📄 AuthProvider.tsx     # Auth context
│   │   ├── 📁 sections/                # Page sections
│   │   │   ├── 📄 ApplicationProcessSection.tsx # Process steps
│   │   │   ├── 📄 CompanyValuesSection.tsx      # Company values
│   │   │   ├── 📄 HeroSection.tsx               # Hero section
│   │   │   └── 📄 JobListingsSection.tsx        # Job listings
│   │   ├── 📁 ui/                      # Base UI components
│   │   │   ├── 📄 Button.tsx           # Button component
│   │   │   ├── 📄 CountryCodeSelector.tsx # Country selector
│   │   │   ├── 📄 FileAccess.tsx       # File access
│   │   │   ├── 📄 Input.tsx            # Input component
│   │   │   ├── 📄 LoadingSpinner.tsx   # Loading spinner
│   │   │   └── 📄 NotificationCenter.tsx # Notifications
│   │   ├── 📄 ChunkLoadErrorBoundary.tsx # Chunk error handling
│   │   ├── 📄 ChunkLoadErrorHandler.tsx    # Chunk error handler
│   │   ├── 📄 ErrorBoundary.tsx        # General error boundary
│   │   └── 📄 GlobalErrorHandler.tsx   # Global error handler
│   ├── 📁 hooks/                       # Custom React hooks
│   │   └── 📄 useApplicationUpdates.ts # App update hook
│   ├── 📁 lib/                         # Utility libraries
│   │   ├── 📄 activity-service.ts      # Activity management
│   │   ├── 📄 application-lifecycle-service.ts # App lifecycle
│   │   ├── 📄 application-status-service.ts    # Status management
│   │   ├── 📄 auth.ts                  # Authentication config
│   │   ├── 📄 demo-accounts.ts         # Demo accounts
│   │   ├── 📄 email-service.ts         # Email service
│   │   ├── 📄 prisma.ts                # Database client
│   │   └── 📄 utils.ts                 # Utility functions
│   ├── 📁 styles/                      # Global styles
│   │   └── 📄 globals.css              # Global CSS
│   └── 📁 types/                       # TypeScript types
│       ├── 📄 admin.ts                 # Admin types
│       └── 📄 next-auth.d.ts           # NextAuth types
├── 📁 prisma/                          # Database schema
│   ├── 📁 migrations/                  # Database migrations
│   │   ├── 📁 20250926071429_db_created/
│   │   ├── 📁 20250926073510_expected_salary_column_added/
│   │   ├── 📁 20250926081058_hr_functionality_to_add_hr_created/
│   │   ├── 📁 20250926083150_adding_dummy_data/
│   │   ├── 📁 20251004212445_add_country_code_column/
│   │   └── 📄 migration_lock.toml
│   ├── 📄 schema.prisma                # Database schema
│   └── 📄 seed.ts                      # Database seeding
├── 📄 env.example                      # Environment variables example
├── 📄 next-env.d.ts                    # Next.js types
├── 📄 next.config.js                   # Next.js configuration
├── 📄 package.json                     # Dependencies
├── 📄 package-lock.json                # Lock file
├── 📄 postcss.config.js                # PostCSS config
├── 📄 README.md                        # Main README
├── 📄 tailwind.config.js               # Tailwind CSS config
└── 📄 tsconfig.json                    # TypeScript config
```

---

## 🎯 **Component Functionality & Button Details**

### 🏠 **Home Page (`/`)**
**File**: `src/app/page.tsx`

#### **Hero Section**
- **Background**: `#050F33` (Dark Navy)
- **Text Color**: White with gradient effects
- **Buttons**:
  - **"Browse Open Positions"**: `#40299B` background, white text, hover: `#3A2588`
  - **"Go to Dashboard"** (if logged in): White/10 background, white text
  - **"Sign In"** (if not logged in): White/10 background, white text

#### **Job Listings Section**
- **Background**: `#F8FAFC` (Light Gray)
- **Cards**: White background with `#E2E8F0` borders
- **Buttons**:
  - **"Load More Positions"**: `#40299B` background
  - **"View All Positions"**: `#F8FAFC` background, `#1E293B` text

#### **Company Values Section**
- **Icons**: Various colors (Yellow, Red, Green, Blue, `#40299B`, Pink)
- **Background**: `#F8FAFC`
- **Buttons**:
  - **"Explore Opportunities"**: `#40299B` background
  - **"Learn About Culture"**: `#F8FAFC` background

#### **Application Process Section**
- **Step Indicators**: `#40299B` background
- **Connection Lines**: `#40299B`/20 opacity
- **Background**: `#F8FAFC`

---

### 🔐 **Authentication Pages**

#### **Login Page (`/login`)**
**File**: `src/app/login/page.tsx`

**Form Elements**:
- **Email Input**: White background, `#E2E8F0` border
- **Password Input**: White background, `#E2E8F0` border
- **Login Button**: `#40299B` background, white text
- **Register Link**: `#40299B` text color

#### **Register Page (`/register`)**
**File**: `src/app/register/page.tsx`

**Form Elements**:
- **All Inputs**: White background, `#E2E8F0` borders
- **Register Button**: `#40299B` background
- **Login Link**: `#40299B` text color

---

### 👤 **Applicant Dashboard (`/applicant/dashboard`)**
**File**: `src/app/applicant/dashboard/page.tsx`

#### **Navigation Tabs**
- **Active Tab**: `#40299B` background, white text
- **Inactive Tabs**: `#F8FAFC` background, `#475569` text

#### **Application Cards**
- **Background**: White
- **Border**: `#E2E8F0`
- **Status Badges**:
  - **Pending**: `#FEF3C7` background, `#D97706` text
  - **Under Review**: `#E0E7FF` background, `#4F46E5` text
  - **Interview Scheduled**: `#E9D5FF` background, `#7C3AED` text
  - **Accepted**: `#D1FAE5` background, `#059669` text
  - **Rejected**: `#FFE4E6` background, `#DC2626` text

#### **Buttons**
- **"View Profile"**: `#F8FAFC` background, `#475569` text
- **"View Job"**: `#F8FAFC` background, `#475569` text

---

### 👔 **HR Dashboard (`/hr/dashboard`)**
**File**: `src/app/hr/dashboard/page.tsx`

#### **Statistics Cards**
- **Background**: White
- **Icons**: `#40299B` background
- **Numbers**: `#1E293B` text
- **Labels**: `#475569` text

#### **Quick Actions**
- **"Post New Job"**: `#40299B` background
- **"Schedule Interview"**: `#059669` background
- **"View Applications"**: `#F8FAFC` background

#### **Recent Applications Table**
- **Headers**: `#F8FAFC` background, `#475569` text
- **Rows**: White background, `#1E293B` text
- **Action Buttons**: `#40299B` background

---

### 🛡️ **Admin Dashboard (`/admin/dashboard`)**
**File**: `src/app/admin/dashboard/page.tsx`

#### **Overview Tab**
- **Metrics Cards**: White background, `#40299B` icons
- **Charts**: Various colors for different metrics
- **Quick Stats**: `#F8FAFC` background

#### **Final Approval Tab**
- **Application Cards**: White background
- **"Hire Candidate"**: `#059669` background
- **"Final Reject"**: `#DC2626` background
- **"View Full Profile"**: `#F8FAFC` background

#### **HR Management Tab**
- **HR Users Table**: White background
- **"Create HR"**: `#40299B` background
- **"Edit"**: `#F8FAFC` background
- **"Delete"**: `#DC2626` background

---

### 📊 **HR Analytics (`/hr/analytics`)**
**File**: `src/app/hr/analytics/page.tsx`

#### **Analytics Tabs**
- **Overview**: `#40299B` gradient
- **Performance**: `#059669` gradient
- **Trends**: `#D97706` gradient
- **Sources**: `#DC2626` gradient

#### **Charts & Graphs**
- **Bar Charts**: `#40299B` primary color
- **Line Charts**: Various colors for different metrics
- **Pie Charts**: Color-coded segments

#### **Metrics Cards**
- **Background**: White
- **Icons**: `#40299B` background
- **Values**: `#1E293B` text
- **Labels**: `#475569` text

---

### 📅 **Interview Management (`/hr/interviews`)**
**File**: `src/app/hr/interviews/page.tsx`

#### **Interview Cards**
- **Background**: White
- **Status Indicators**:
  - **Scheduled**: `#E0E7FF` background, `#4F46E5` text
  - **Completed**: `#D1FAE5` background, `#059669` text
  - **Cancelled**: `#FFE4E6` background, `#DC2626` text

#### **Action Buttons**
- **"Schedule Interview"**: `#40299B` background
- **"Edit Interview"**: `#F8FAFC` background
- **"Cancel Interview"**: `#DC2626` background
- **"View Evaluation"**: `#059669` background

#### **Interview Types**
- **Video**: `#40299B` icon color
- **Phone**: `#4F46E5` icon color
- **In Person**: `#059669` icon color

---

### 👥 **Admin Oversight (`/admin/oversight`)**
**File**: `src/app/admin/oversight/page.tsx`

#### **Oversight Tabs**
- **Overview**: `#40299B` active color
- **Applicants**: `#4F46E5` active color
- **Applications**: `#059669` active color
- **HR Users**: `#D97706` active color
- **Jobs**: `#DC2626` active color
- **Interview Management**: `#7C3AED` active color

#### **Data Tables**
- **Headers**: `#F8FAFC` background
- **Rows**: White background, alternating `#F8FAFC`
- **Action Buttons**: Various colors based on action

#### **Filters & Search**
- **Search Input**: White background, `#E2E8F0` border
- **Filter Dropdowns**: White background
- **"Clear Filters"**: `#DC2626` background
- **"Refresh"**: `#40299B` background

---

### 📝 **Application Management Component**
**File**: `src/components/application/ApplicationManagement.tsx`

#### **Application Cards**
- **Background**: White
- **Border**: `#E2E8F0`
- **Hover**: `#F8FAFC` background, shadow effect

#### **Status Badges**
- **Pending**: `#FEF3C7` background, `#D97706` text
- **Under Review**: `#E0E7FF` background, `#4F46E5` text
- **Interview Scheduled**: `#E9D5FF` background, `#7C3AED` text
- **Interview Completed**: `#E0E7FF` background, `#4F46E5` text
- **Accepted**: `#D1FAE5` background, `#059669` text
- **Rejected**: `#FFE4E6` background, `#DC2626` text
- **Hired**: `#D1FAE5` background, `#059669` text

#### **Action Buttons**
- **"Under Review"**: `#40299B` background
- **"Schedule Interview"**: `#40299B` background
- **"Reject"**: `#DC2626` background
- **"Final Approval"**: `#059669` background
- **"View Profile"**: `#F8FAFC` background
- **"View Job"**: `#F8FAFC` background

---

### 🎨 **UI Components**

#### **Button Component (`src/components/ui/Button.tsx`)**
**Variants**:
- **Primary**: `#40299B` background, white text, hover: `#3A2588`
- **Secondary**: `#F8FAFC` background, `#475569` text, `#E2E8F0` border
- **Destructive**: `#DC2626` background, white text
- **Outline**: Transparent background, `#E2E8F0` border
- **Ghost**: Transparent background, hover: `#F8FAFC`
- **Link**: `#40299B` text, underline on hover

#### **Input Component (`src/components/ui/Input.tsx`)**
**States**:
- **Default**: White background, `#E2E8F0` border
- **Focus**: `#40299B` border, `#40299B`/20 ring
- **Error**: `#DC2626` border
- **Disabled**: `#F8FAFC` background, `#64748B` text

#### **Loading Spinner (`src/components/ui/LoadingSpinner.tsx`)**
**Colors**:
- **Spinner**: `#40299B` color
- **Background**: Transparent or white overlay

---

### 🔧 **Error Handling Components**

#### **ChunkLoadErrorHandler (`src/components/ChunkLoadErrorHandler.tsx`)**
**Error Toast**:
- **Background**: `#40299B`
- **Text**: White
- **Position**: Fixed top-right
- **Animation**: Fade in/out

#### **ErrorBoundary (`src/components/ErrorBoundary.tsx`)**
**Error Display**:
- **Background**: White
- **Border**: `#DC2626`
- **Text**: `#1E293B`
- **Retry Button**: `#40299B` background

---

### 📧 **Email Service (`src/lib/email-service.ts`)**
**Email Types**:
- **Application Confirmation**: `#059669` accent
- **Interview Scheduled**: `#40299B` accent
- **Hired**: `#059669` accent
- **Rejected**: `#DC2626` accent

---

### 🗄️ **Database Schema (`prisma/schema.prisma`)**
**Models**:
- **User**: Authentication and profile data
- **Job**: Job postings and requirements
- **Application**: Job applications and status
- **Interview**: Interview scheduling and details
- **Department**: Organizational structure
- **Notification**: User notifications
- **EmailLog**: Email tracking and history

---

### 🎯 **Key Functionalities**

#### **Authentication Flow**
1. **Login/Register** → **Role-based Redirect**
2. **Session Management** → **Protected Routes**
3. **Role-based Access** → **Different Dashboards**

#### **Application Workflow**
1. **Submit Application** → **PENDING**
2. **HR Review** → **UNDER_REVIEW**
3. **Schedule Interview** → **INTERVIEW_SCHEDULED**
4. **Complete Interview** → **INTERVIEW_COMPLETED**
5. **HR Evaluation** → **ACCEPTED**
6. **Admin Final Decision** → **HIRED/REJECTED**

#### **Email Notifications**
- **Application Submitted**: Confirmation email
- **Interview Scheduled**: Interview details
- **Application Accepted**: Congratulations
- **Application Rejected**: Rejection notice

#### **File Management**
- **Resume Upload**: AWS S3 integration
- **File Access**: Role-based permissions
- **File Download**: Secure file serving

---

### 🚀 **Performance Features**

#### **Loading States**
- **Skeleton Loaders**: Gray placeholders
- **Spinner Components**: `#40299B` color
- **Progressive Loading**: Chunk-based loading

#### **Caching Strategy**
- **Browser Cache**: Static assets
- **API Cache**: Response caching
- **Database Cache**: Query optimization

#### **Error Recovery**
- **Chunk Load Errors**: Automatic retry
- **Network Errors**: Retry mechanism
- **Form Errors**: Validation feedback

---

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Mobile Adaptations**
- **Navigation**: Collapsible sidebar
- **Tables**: Horizontal scroll
- **Cards**: Stacked layout
- **Buttons**: Full-width on mobile

---

## 🔒 **Security Features**

### **Authentication**
- **NextAuth.js**: Secure session management
- **Role-based Access**: HR, Admin, Applicant
- **Protected Routes**: Route guards

### **Data Protection**
- **Input Validation**: Zod schemas
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: React sanitization
- **CSRF Protection**: NextAuth built-in

---

## 🎨 **Design System**

### **Typography**
- **Font**: Mulish (Google Fonts)
- **Headings**: `#1E293B` color
- **Body Text**: `#475569` color
- **Muted Text**: `#64748B` color

### **Spacing**
- **Container**: Max-width 1200px
- **Padding**: 16px, 24px, 32px
- **Margins**: 8px, 16px, 24px, 32px
- **Gaps**: 4px, 8px, 16px, 24px

### **Shadows**
- **Card**: `0 1px 3px rgba(0,0,0,0.1)`
- **Card Hover**: `0 4px 6px rgba(0,0,0,0.1)`
- **Modal**: `0 10px 15px rgba(0,0,0,0.1)`

---

## 🚀 **Deployment Ready**

### **Build Configuration**
- **Next.js 15**: Latest version
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Prisma**: Database ORM

### **Environment Variables**
- **Database**: PostgreSQL connection
- **Authentication**: NextAuth secrets
- **Email**: SMTP configuration
- **File Storage**: AWS S3 credentials

---

*This comprehensive guide covers every component, button, color, and functionality in the amealio Careers Portal. All colors are current and match the implemented design system.*
