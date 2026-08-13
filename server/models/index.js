import mongoose from 'mongoose';

const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], default: 'STUDENT', index: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: true },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

// Category Schema
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'BookOpen' },
}, { timestamps: true });

// Resource Sub-schema
const resourceSchema = new Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '1.2 MB' },
});

// Lesson Sub-schema
const lessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  contentType: { type: String, enum: ['VIDEO', 'TEXT'], default: 'VIDEO' },
  videoUrl: { type: String, default: '' },
  videoDurationSeconds: { type: Number, default: 300 },
  textContent: { type: String, default: '' },
  isFreePreview: { type: Boolean, default: false },
  orderIndex: { type: Number, required: true },
  resources: [resourceSchema],
}, { timestamps: true });

// Question Sub-schema
const questionSchema = new Schema({
  questionText: { type: String, required: true },
  explanation: { type: String, default: '' },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  orderIndex: { type: Number, default: 0 },
});

// Quiz Sub-schema
const quizSchema = new Schema({
  title: { type: String, required: true },
  passingScore: { type: Number, default: 70 }, // percentage
  attemptLimit: { type: Number, default: 3 }, // 0 for unlimited
  timeLimitMinutes: { type: Number, default: 15 },
  questions: [questionSchema],
});

// Section Sub-schema
const sectionSchema = new Schema({
  title: { type: String, required: true, trim: true },
  orderIndex: { type: Number, required: true },
  lessons: [lessonSchema],
  quizzes: [quizSchema],
}, { timestamps: true });

// Course Schema
const courseSchema = new Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER', index: true },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  totalRatingsCount: { type: Number, default: 24 },
  durationSeconds: { type: Number, default: 3600 },
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date, default: null },
  sections: [sectionSchema],
}, { timestamps: true });

// Enrollment Schema
const enrollmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  overallProgressPercentage: { type: Number, default: 0 },
}, { timestamps: true });
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// LessonProgress Schema
const lessonProgressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  lessonId: { type: String, required: true, index: true },
  isCompleted: { type: Boolean, default: false },
  videoPositionSeconds: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });
lessonProgressSchema.index({ user: 1, course: 1, lessonId: 1 }, { unique: true });

// QuizAttempt Schema
const quizAttemptSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true }, // percentage
  passed: { type: Boolean, required: true },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: Date.now },
  answers: [{
    questionId: String,
    selectedOptionIndex: Number,
    isCorrect: Boolean,
  }],
}, { timestamps: true });

// Certificate Schema
const certificateSchema = new Schema({
  certificateCode: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// AuditLog Schema
const auditLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'System/Guest' },
  action: { type: String, required: true, index: true },
  targetEntity: { type: String, required: true },
  targetId: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
  details: { type: String, default: '' },
}, { timestamps: true });

// PlatformSettings Schema
const platformSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Course = mongoose.model('Course', courseSchema);
export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export const Certificate = mongoose.model('Certificate', certificateSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
