const request = require('supertest');
const app = require('../server');

describe('Server', () => {
  test('GET / should return 404', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(404);
  });

  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('ECOSHARE API is running');
  });
});
