import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { connectDB, closeDB } from '../server/config/db.js';
import { seedDatabase } from '../server/seed.js';

describe('Course Discovery, Enrollment, Quiz & Certificate Suite', () => {
  let studentToken = '';
  let sampleCourseId = '';
  let sampleQuizId = '';

  beforeAll(async () => {
    await seedDatabase();

    // Login student
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@edupulse.com', password: 'Student123!' });
    studentToken = loginRes.body.data.token;

    // Fetch courses
    const coursesRes = await request(app).get('/api/courses');
    sampleCourseId = coursesRes.body.data.courses[0]._id;
    sampleQuizId = coursesRes.body.data.courses[0].sections[0].quizzes[0]._id;
  });

  afterAll(async () => {
    await closeDB();
  });

  it('should list published courses in catalog', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courses.length).toBeGreaterThan(0);
  });

  it('should allow student to enroll in course', async () => {
    const res = await request(app)
      .post('/api/enrollments/enroll')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseId: sampleCourseId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should evaluate quiz attempt and return passing score', async () => {
    const quizRes = await request(app)
      .get(`/api/quizzes/${sampleCourseId}/${sampleQuizId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(quizRes.status).toBe(200);
    const questions = quizRes.body.data.quiz.questions;

    // Submit correct answers for questions
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: 1, // Option Index 1 is correct in seed
    }));

    const submitRes = await request(app)
      .post(`/api/quizzes/${sampleCourseId}/${sampleQuizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.score).toBeDefined();
  });

  it('should verify sample certificate via public verification code', async () => {
    const certCode = 'EDUPULSE-DEMO-CERT-2026';
    const res = await request(app).get(`/api/certificates/verify/${certCode}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.certificateCode).toBe(certCode);
  });
});
