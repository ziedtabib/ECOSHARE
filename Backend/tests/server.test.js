const request = require('supertest');
const mongoose = require('mongoose');

// Import the server instance instead of the app
const { server } = require('../server');

describe('Server', () => {
  // Close server and disconnect from MongoDB after all tests
  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('GET / should return 404', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(404);
  });

  test('GET /api/health should return 200', async () => {
    const response = await request(server).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('ECOSHARE API is running');
  });
});
