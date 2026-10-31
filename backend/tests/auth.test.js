const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  const testUser = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'StrongPass1'
  };

  it('registers a new user with an account', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.account.account_number).toBeDefined();
    expect(res.body.account.balance).toBe(0);
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('rejects weak passwords', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Weak Pass',
      email: 'weak@example.com',
      password: 'weak'
    });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPass1'
    });
    expect(res.status).toBe(401);
  });

  it('rejects access to protected route without token', async () => {
    const res = await request(app).get('/api/accounts/dashboard');
    expect(res.status).toBe(401);
  });

  it('allows access to protected route with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.body.accessToken;

    const res = await request(app)
      .get('/api/accounts/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.account).toBeDefined();
  });
});
