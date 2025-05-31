const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/v1/courses', () => {
  it('should return all courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  }, 10000); // increase timeout
});