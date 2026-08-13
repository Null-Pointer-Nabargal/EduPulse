import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import {
  User,
  Category,
  Course,
  Enrollment,
  LessonProgress,
  QuizAttempt,
  Certificate,
  AuditLog,
  PlatformSettings,
} from './models/index.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 Starting EduPulse Database Seeding...');
  await connectDB();

  // Clear existing collections
  await User.deleteMany({});
  await Category.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
  await LessonProgress.deleteMany({});
  await QuizAttempt.deleteMany({});
  await Certificate.deleteMany({});
  await AuditLog.deleteMany({});
  await PlatformSettings.deleteMany({});

  console.log('🧹 Cleared existing database records.');

  // Password Hashes
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const instructorPasswordHash = await bcrypt.hash('Instructor123!', 10);

  // 1. Create Users
  const adminUser = await User.create({
    name: 'Eleanor Vance (Admin)',
    email: 'admin@edupulse.com',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Lead Platform Administrator & System Architect at EduPulse.',
    isActive: true,
    emailVerified: true,
  });

  const studentUser = await User.create({
    name: 'Alex Mercer (Student)',
    email: 'student@edupulse.com',
    passwordHash: studentPasswordHash,
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Enthusiastic Software Engineer pursuing Master-level Full Stack development.',
    isActive: true,
    emailVerified: true,
  });

  const instructorUser = await User.create({
    name: 'Dr. Marcus Vance',
    email: 'instructor@edupulse.com',
    passwordHash: instructorPasswordHash,
    role: 'INSTRUCTOR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Senior Principal Software Engineer & AI Researcher with 15+ years of teaching experience.',
    isActive: true,
    emailVerified: true,
  });

  console.log('👤 Seeded Default Users (Admin & Student)');

  // 2. Create Categories
  const catWebDev = await Category.create({
    name: 'Web Development',
    slug: 'web-development',
    description: 'Master modern frontend and backend frameworks like React, Node.js, Next.js, and Express.',
    icon: 'Code',
  });

  const catDataScience = await Category.create({
    name: 'Data Science & AI',
    slug: 'data-science-ai',
    description: 'Explore Python data engineering, Machine Learning, Deep Learning, and LLMs.',
    icon: 'Cpu',
  });

  const catDesign = await Category.create({
    name: 'UI/UX & Product Design',
    slug: 'ui-ux-design',
    description: 'Design intuitive interfaces, create Figma design systems, and conduct user research.',
    icon: 'Palette',
  });

  const catCloud = await Category.create({
    name: 'Cloud & DevOps',
    slug: 'cloud-devops',
    description: 'Scale microservices using Docker, Kubernetes, AWS, and CI/CD pipelines.',
    icon: 'Cloud',
  });

  console.log('📂 Seeded Categories');

  // 3. Create Courses
  const course1 = await Course.create({
    title: 'Full-Stack Web Development Bootcamp: React, Node & Mongo',
    slug: 'fullstack-web-development-bootcamp',
    summary: 'The ultimate production guide to building high-performance modern web apps from scratch.',
    description: `Master modern web development from foundation to cloud production. In this course, you will build scalable applications using React, Express, MongoDB, Node.js, and TypeScript.
    
Key Highlights:
• Advanced React State Management & Custom Hooks
• Rest API Architecture & JWT Security Hardening
• Production MongoDB Aggregation Pipelines
• Automated Testing with Vitest and Supertest
• Continuous Integration & Docker Deployment`,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    category: catWebDev._id,
    instructor: instructorUser._id,
    level: 'INTERMEDIATE',
    price: 89.99,
    rating: 4.9,
    totalRatingsCount: 142,
    durationSeconds: 14400,
    isPublished: true,
    publishedAt: new Date(),
    sections: [
      {
        title: 'Module 1: Modern JavaScript & Architecture Fundamentals',
        orderIndex: 1,
        lessons: [
          {
            title: '1. Course Overview & Production Mindset',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDurationSeconds: 600,
            textContent: 'Welcome to the course! In this lesson we establish our architectural principles.',
            isFreePreview: true,
            orderIndex: 1,
            resources: [
              { title: 'Architecture Blueprint PDF', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'PDF', fileSize: '2.4 MB' },
            ],
          },
          {
            title: '2. Async JS, Promises & Event Loop Deep Dive',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoDurationSeconds: 900,
            textContent: 'Detailed breakdown of the Node.js event loop, macro-tasks vs micro-tasks.',
            isFreePreview: false,
            orderIndex: 2,
            resources: [],
          },
          {
            title: '3. Clean Code & Modular Folder Organization',
            contentType: 'TEXT',
            videoUrl: '',
            videoDurationSeconds: 0,
            textContent: `# Clean Architecture Guidelines

1. **Separation of Concerns**: Controllers route HTTP logic; Services encapsulate business logic; Models define data schemas.
2. **Centralized Error Handling**: Never expose raw stack traces to clients.
3. **Environment Isolation**: Always read sensitive credentials from encrypted environment configs.`,
            isFreePreview: true,
            orderIndex: 3,
            resources: [],
          },
        ],
        quizzes: [
          {
            title: 'Module 1 Assessment: Architecture & JavaScript',
            passingScore: 70,
            attemptLimit: 3,
            timeLimitMinutes: 10,
            questions: [
              {
                questionText: 'Which of the following executes first in the Node.js Event Loop?',
                explanation: 'Microtasks (Promises/process.nextTick) are executed immediately after the current operation finishes, before timer callbacks.',
                options: [
                  { text: 'setTimeout callback', isCorrect: false },
                  { text: 'Promise.resolve().then() microtask', isCorrect: true },
                  { text: 'setImmediate callback', isCorrect: false },
                  { text: 'fs.readFile I/O callback', isCorrect: false },
                ],
                orderIndex: 1,
              },
              {
                questionText: 'What is the primary security risk of storing raw JWT tokens in browser LocalStorage?',
                explanation: 'LocalStorage is accessible by any JavaScript running on the same domain, making it vulnerable to Cross-Site Scripting (XSS) attacks.',
                options: [
                  { text: 'Vulnerability to XSS script injection', isCorrect: true },
                  { text: 'Vulnerability to SQL Injection', isCorrect: false },
                  { text: 'Server overload during token lookup', isCorrect: false },
                  { text: 'Automatic cookie expiration failure', isCorrect: false },
                ],
                orderIndex: 2,
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2: Building Secure Express & MongoDB APIs',
        orderIndex: 2,
        lessons: [
          {
            title: '4. RESTful API Routing & Middleware Pipeline',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoDurationSeconds: 1200,
            textContent: 'Step-by-step setup of Express routes, input validation using Zod, and rate-limiting.',
            isFreePreview: false,
            orderIndex: 1,
            resources: [
              { title: 'Express Middleware Checklist', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'PDF', fileSize: '1.1 MB' },
            ],
          },
          {
            title: '5. Mongoose Data Schema & Indexing Optimization',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            videoDurationSeconds: 1050,
            textContent: 'Designing normalized schemas, compound indexes, and foreign reference populations.',
            isFreePreview: false,
            orderIndex: 2,
            resources: [],
          },
        ],
        quizzes: [],
      },
    ],
  });

  const course2 = await Course.create({
    title: 'Python for Artificial Intelligence & Machine Learning',
    slug: 'python-ai-machine-learning-masterclass',
    summary: 'From Scikit-Learn to PyTorch: Build and deploy production machine learning models.',
    description: `Unlock the power of Artificial Intelligence! Learn Python data manipulation with Pandas & NumPy, train supervised and unsupervised ML models, and build neural networks with PyTorch.`,
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
    category: catDataScience._id,
    instructor: instructorUser._id,
    level: 'ADVANCED',
    price: 119.99,
    rating: 5.0,
    totalRatingsCount: 98,
    durationSeconds: 21600,
    isPublished: true,
    publishedAt: new Date(),
    sections: [
      {
        title: 'Section 1: Data Engineering with NumPy & Pandas',
        orderIndex: 1,
        lessons: [
          {
            title: '1. NumPy Vectorization & Matrix Computation',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            videoDurationSeconds: 850,
            textContent: 'Speeding up mathematical calculations using NumPy arrays.',
            isFreePreview: true,
            orderIndex: 1,
            resources: [],
          },
          {
            title: '2. Exploratory Data Analysis & Feature Engineering',
            contentType: 'TEXT',
            videoUrl: '',
            videoDurationSeconds: 0,
            textContent: `Exploratory Data Analysis (EDA) is the foundational step before model training. Clean missing values, encode categorical variables, and apply standard scaling.`,
            isFreePreview: false,
            orderIndex: 2,
            resources: [],
          },
        ],
        quizzes: [],
      },
    ],
  });

  const course3 = await Course.create({
    title: 'UI/UX Design Systems in Figma: Crafting Modern Products',
    slug: 'ui-ux-design-systems-figma',
    summary: 'Master component libraries, Auto Layout 5.0, design tokens, and interactive prototyping.',
    description: `Create world-class UI design systems. Master Figma Auto-Layout, dynamic variables, dark/light color tokens, typography scales, and seamless handoff to engineering.`,
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    category: catDesign._id,
    instructor: instructorUser._id,
    level: 'BEGINNER',
    price: 49.99,
    rating: 4.8,
    totalRatingsCount: 76,
    durationSeconds: 10800,
    isPublished: true,
    publishedAt: new Date(),
    sections: [
      {
        title: 'Section 1: Design Tokens & Typography Systems',
        orderIndex: 1,
        lessons: [
          {
            title: '1. Establishing Scales and Color Tokens',
            contentType: 'VIDEO',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyplays.mp4',
            videoDurationSeconds: 700,
            textContent: 'Designing robust color tokens and typography hierarchies.',
            isFreePreview: true,
            orderIndex: 1,
            resources: [],
          },
        ],
        quizzes: [],
      },
    ],
  });

  console.log('📚 Seeded Courses & Curriculum');

  // 4. Enroll Student in Course 1 & Generate Sample Progress & Certificate
  const enrollment = await Enrollment.create({
    user: studentUser._id,
    course: course1._id,
    enrolledAt: new Date(Date.now() - 7 * 86400000),
    completedAt: new Date(),
    overallProgressPercentage: 100,
  });

  const lesson1Id = course1.sections[0].lessons[0]._id.toString();
  const lesson2Id = course1.sections[0].lessons[1]._id.toString();
  const lesson3Id = course1.sections[0].lessons[2]._id.toString();

  await LessonProgress.create({
    user: studentUser._id,
    course: course1._id,
    lessonId: lesson1Id,
    isCompleted: true,
    videoPositionSeconds: 450,
    completedAt: new Date(),
  });

  await LessonProgress.create({
    user: studentUser._id,
    course: course1._id,
    lessonId: lesson2Id,
    isCompleted: true,
    videoPositionSeconds: 900,
    completedAt: new Date(),
  });

  await LessonProgress.create({
    user: studentUser._id,
    course: course1._id,
    lessonId: lesson3Id,
    isCompleted: true,
    completedAt: new Date(),
  });

  const quizId = course1.sections[0].quizzes[0]._id.toString();
  await QuizAttempt.create({
    user: studentUser._id,
    course: course1._id,
    quizId,
    score: 100,
    passed: true,
    startedAt: new Date(),
    finishedAt: new Date(),
  });

  const certificateCode = 'EDUPULSE-DEMO-CERT-2026';
  await Certificate.create({
    certificateCode,
    user: studentUser._id,
    course: course1._id,
    issuedAt: new Date(),
  });

  console.log('🎓 Seeded Sample Student Enrollment, 100% Progress, and Verified Certificate');

  // 5. Seed Audit Logs
  await AuditLog.create({
    user: adminUser._id,
    userName: adminUser.name,
    action: 'SYSTEM_INITIALIZATION',
    targetEntity: 'Platform',
    targetId: 'GLOBAL',
    ipAddress: '127.0.0.1',
    details: 'Database seeded with production course catalog and default credentials.',
  });

  // 6. Platform Settings
  await PlatformSettings.create({
    key: 'siteName',
    value: 'EduPulse International',
    description: 'Main public branding title',
  });
  await PlatformSettings.create({
    key: 'maintenanceMode',
    value: false,
    description: 'System maintenance toggle',
  });

  console.log('✅ EduPulse Database Seeding Complete!');
  console.log('--------------------------------------------------');
  console.log('🔑 TEST CREDENTIALS:');
  console.log('   👑 Administrator: admin@edupulse.com / Admin123!');
  console.log('   🎓 Student Account: student@edupulse.com / Student123!');
  console.log('   👨‍🏫 Instructor: instructor@edupulse.com / Instructor123!');
  console.log(`   📜 Verified Certificate Code: ${certificateCode}`);
  console.log('--------------------------------------------------');
};

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase()
    .then(() => closeDB())
    .catch((err) => {
      console.error('Seeding Error:', err);
      process.exit(1);
    });
}
