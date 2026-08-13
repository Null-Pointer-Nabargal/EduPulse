import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { connectDB, closeDB } from '../server/config/db.js';
import { seedDatabase } from '../server/seed.js';

describe('Authentication & Authorization Suite', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('should authenticate default student account successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@edupulse.com', password: 'Student123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('STUDENT');
  });

  it('should authenticate default admin account successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@edupulse.com', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@edupulse.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should block non-admin users from accessing protected /api/admin routes', async () => {
    // 1. Get student token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@edupulse.com', password: 'Student123!' });
    const studentToken = loginRes.body.data.token;

    // 2. Attempt admin endpoint
    const adminRes = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });
});
