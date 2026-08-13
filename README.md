# EduPulse | Production-Grade Online Learning Platform

![EduPulse Banner](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80)

EduPulse is a production-ready, full-stack online education SaaS platform inspired by **Udemy** and **Coursera**. Designed with modern EdTech architecture, role-based security, a learner marketplace, an LMS course player with video playback position auto-resuming, an embedded quiz engine, verified certificates, and a dedicated SaaS admin suite.

---

## 🌟 Key Features

### 🎓 Learner Experience (`/`)
- **Course Marketplace**: Multi-category filtering, full-text keyword search, difficulty level filters, and sort controls (popularity, newest, ratings, price).
- **Course Details**: Detailed curriculum tree, instructor bio, ratings, section breakdown, and sample lesson preview modal.
- **Distraction-Free LMS Course Player**:
  - HTML5 Video Player with server-synchronized timestamp auto-resuming.
  - Interactive Text & Reading Material reader.
  - Collapsible course outline sidebar with real-time completion checkmarks.
  - Downloadable resource attachments (PDFs, code files).
  - Lesson completion toggles recalculating overall course progress percentage.
- **Embedded LMS Quiz Engine**:
  - Multiple-choice questions with answer choices.
  - Instantaneous scoring & pass/fail evaluation based on course passing score.
  - Attempt counter and detailed question-by-question explanation breakdowns.
- **Student Dashboard**: Welcome banner, active courses with progress bars, completed courses grid, and earned certificates.
- **Verified Certificates & Public Verification**:
  - Automatically issued upon achieving 100% course completion.
  - Unique certificate ID generator.
  - Public verification route: `/certificate/verify/:certificateId` displaying official verified badge and issuer metadata without exposing private learner information.

### 👑 SaaS Admin Suite (`/admin`)
- **Executive Analytics Dashboard**:
  - Key Performance Indicators (Total Users, Active Learners, Total Courses, Published Courses, Enrollments, Completion Rate).
  - Visual category offering distribution bar charts.
  - System telemetry and recent student enrollment feeds.
- **Interactive Course Builder & Manager**:
  - Multi-step wizard for general info, thumbnail URL, category, level, price, and publish toggles.
  - Section module creator, lesson manager (video URLs, text content, free preview toggles), resource uploader, and quiz builder.
- **User Administration**: View users, search/filter by role, role assignment (Student, Instructor, Admin), suspend/activate account status, delete user, and create user modal.
- **Security Audit Logs**: Immutable recording of administrative actions, user creation/deletion, role modifications, and system configuration updates with IP tracking.
- **Platform Controls**: Maintenance mode toggle and global site settings.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons |
| **Backend API** | Node.js, Express.js (ES Modules) |
| **Database & ORM** | MongoDB, Mongoose, MongoMemoryServer (Dev/Test Fallback) |
| **Security & Auth** | JWT (JSON Web Tokens), BcryptJS, Helmet, Express-Rate-Limit, Audit Logger |
| **Testing** | Vitest, Supertest |

---

## 📁 System Architecture & Directory Structure

```text
E-Learning Platform/
├── frontend/                     # React Single Page Application (Client)
│   ├── src/
│   │   ├── components/           # Layout, Navbar, Footer, Common UI
│   │   │   └── layout/
│   │   ├── context/              # AuthContext & Session Provider
│   │   ├── pages/                # Learner Pages & LMS Player
│   │   │   ├── admin/            # Admin Panel Pages & Course Builder
│   │   │   └── auth/             # Login & Register Pages
│   │   ├── App.jsx               # Top-level Router Definition
│   │   ├── index.css             # Tailwind CSS & Glassmorphism Design
│   │   └── main.jsx              # React Entry Point
│   ├── .env                      # Frontend Environment Variables
│   ├── index.html                # HTML Skeleton
│   ├── package.json              # Client Dependencies
│   ├── postcss.config.js         # PostCSS Config
│   ├── tailwind.config.js        # Tailwind Theme Tokens
│   └── vite.config.js            # Vite Dev Server & API Proxy
│
├── server/                       # Express Node.js Backend API
│   ├── config/
│   │   └── db.js                 # Mongoose Connection & Memory Server Manager
│   ├── middleware/
│   │   ├── auditLog.js           # Security Audit Logging Helper
│   │   └── auth.js               # JWT Auth & Server-Side RBAC Guards
│   ├── models/
│   │   └── index.js              # Mongoose Data Schemas
│   ├── routes/
│   │   ├── admin.routes.js       # Admin Analytics, User & Course Management APIs
│   │   ├── auth.routes.js        # Auth, Register, Login, Profile APIs
│   │   ├── certificate.routes.js # Certificate List & Public Verification APIs
│   │   ├── course.routes.js     # Public Course Catalog & Detail APIs
│   │   ├── enrollment.routes.js  # Student Course Enrollment APIs
│   │   ├── progress.routes.js    # Video Timestamp & Progress APIs
│   │   └── quiz.routes.js        # Quiz Fetch & Evaluation APIs
│   ├── .env                      # Server Environment Config
│   ├── index.js                  # Main Express Server Entry Point
│   ├── package.json              # Server Dependencies
│   └── seed.js                   # Database Seeder Script
│
├── tests/                        # Vitest Integration & Unit Test Suite
│   ├── auth.test.js              # Auth & RBAC Security Tests
│   └── course_flow.test.js       # Enrollment, Quiz & Certificate Tests
│
├── .env                          # Root Environment Variables
├── README.md                     # Technical Documentation
└── package.json                  # Root Workspace Scripts
```

---

## ⚙️ Environment Configuration

### Frontend `.env` (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Server `.env` (`/server/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000

# Security & Secrets
JWT_SECRET=edupulse_super_secret_jwt_key_2026_production_grade
JWT_EXPIRES_IN=7d

# Database Configuration (Leave empty for auto fallback)
MONGODB_URI=mongodb://127.0.0.1:27017/edupulse

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Install root, frontend, and server dependencies:
```bash
# Install root workspace packages
npm install

# Install frontend packages
cd frontend
npm install

# Install server packages
cd ../server
npm install
```

### 2. Seed Database with Development Data
Populate MongoDB with pre-built courses, sections, lessons, quizzes, test users, and verified certificates:
```bash
cd server
npm run seed
```

### 3. Run the Backend API Server
Start the Express server on port **5000**:
```bash
cd server
npm run dev
```
- Health Check: `http://localhost:5000/api/health`

### 4. Run the Frontend Web Application
In a new terminal, start the Vite development server on port **3000**:
```bash
cd frontend
npm run dev
```
- Learner Application: `http://localhost:3000`

---

## 🔑 Test Credentials & Demo Accounts

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **👑 Administrator** | `admin@edupulse.com` | `Admin123!` | Full Control (`/admin`) |
| **🎓 Student** | `student@edupulse.com` | `Student123!` | Learner Portal (`/dashboard`) |
| **👨‍🏫 Instructor** | `instructor@edupulse.com` | `Instructor123!` | Course Creator |

**Verified Certificate Demo Code**: `EDUPULSE-DEMO-CERT-2026`  
**Public Verification URL**: `http://localhost:3000/certificate/verify/EDUPULSE-DEMO-CERT-2026`

---

## 📡 API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account.
- `POST /api/auth/login` — Authenticate user & issue JWT.
- `GET /api/auth/me` — Get current logged-in user profile.
- `PUT /api/auth/profile` — Update name, bio, avatar, or password.

### Courses & Catalog (`/api/courses`)
- `GET /api/courses` — Search & filter published courses (category, level, sort, page).
- `GET /api/courses/categories` — Get list of categories.
- `GET /api/courses/detail/:slug` — Get full course details, sections, and curriculum tree.

### Enrollments & Progress (`/api/enrollments` & `/api/progress`)
- `POST /api/enrollments/enroll` — Enroll student in a course.
- `GET /api/enrollments/my-courses` — Get student's enrolled courses with progress %.
- `POST /api/progress/video-position` — Save video playback position timestamp.
- `POST /api/progress/mark-complete` — Toggle lesson completion status.
- `GET /api/progress/course/:courseId` — Get student progress records for a course.

### Quizzes & Certificates (`/api/quizzes` & `/api/certificates`)
- `GET /api/quizzes/:courseId/:quizId` — Fetch quiz questions (without answers).
- `POST /api/quizzes/:courseId/:quizId/submit` — Submit & grade quiz attempt.
- `GET /api/certificates/my-certificates` — Get student's earned certificates.
- `GET /api/certificates/verify/:code` — Public endpoint verifying authentic certificates.

### Admin Operations (`/api/admin` - Protected by `requireRole('ADMIN')`)
- `GET /api/admin/analytics` — Platform KPIs, enrollment trends, category statistics.
- `GET /api/admin/users` — Search & list user accounts.
- `POST /api/admin/users` — Create user account.
- `PUT /api/admin/users/:id` — Update user role or active/suspended status.
- `DELETE /api/admin/users/:id` — Delete user account.
- `GET /api/admin/courses` — List all draft & published courses.
- `POST /api/admin/courses` — Create new course with sections, lessons, and quizzes.
- `PUT /api/admin/courses/:id` — Update course structure & toggle publish state.
- `DELETE /api/admin/courses/:id` — Delete course.
- `GET /api/admin/audit-logs` — View system security audit logs.
- `PUT /api/admin/settings` — Save platform settings.

---

## 🧪 Automated Testing

Run the automated Vitest test suite covering auth, enrollment, quiz evaluation, and certificate verification:
```bash
npm test
```

---

## 📦 Production Deployment Build

To create the optimized production build:
```bash
cd frontend
npm run build
```
This outputs compiled assets to `frontend/dist`. The Node/Express server will automatically serve static frontend files from `frontend/dist` when `NODE_ENV=production`.

---

## 📄 License
This project is open-source software built under the MIT License.
