const request = require('supertest');
const app = require('../src/app');

describe('Transactions API', () => {
  let tokenA, accountA, tokenB, accountB;

  beforeAll(async () => {
    const userA = { fullName: 'Alice', email: 'alice@example.com', password: 'AlicePass1' };
    const userB = { fullName: 'Bob', email: 'bob@example.com', password: 'BobPass123' };

    const regA = await request(app).post('/api/auth/register').send(userA);
    accountA = regA.body.account;
    const loginA = await request(app).post('/api/auth/login').send({ email: userA.email, password: userA.password });
    tokenA = loginA.body.accessToken;

    const regB = await request(app).post('/api/auth/register').send(userB);
    accountB = regB.body.account;
    const loginB = await request(app).post('/api/auth/login').send({ email: userB.email, password: userB.password });
    tokenB = loginB.body.accessToken;
  });

  it('deposits money into own account', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ accountId: accountA.id, amount: 1000, description: 'Initial deposit' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe('DEPOSIT');
    expect(res.body.transaction.balance_after).toBe(100000); // paise
  });

  it('rejects deposit with zero or negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ accountId: accountA.id, amount: -50 });
    expect(res.status).toBe(400);
  });

  it('rejects withdrawal exceeding balance', async () => {
    const res = await request(app)
      .post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ accountId: accountA.id, amount: 999999 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insufficient/i);
  });

  it('withdraws valid amount', async () => {
    const res = await request(app)
      .post('/api/transactions/withdraw')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ accountId: accountA.id, amount: 200 });
    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe('WITHDRAWAL');
  });

  it('rejects transfer to a nonexistent account', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ fromAccountId: accountA.id, toAccountNumber: '0000000000', amount: 100 });
    expect(res.status).toBe(404);
  });

  it('rejects transfer to self', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ fromAccountId: accountA.id, toAccountNumber: accountA.account_number, amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/own account/i);
  });

  it('rejects transfer from an account the user does not own', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ fromAccountId: accountA.id, toAccountNumber: accountB.account_number, amount: 100 });
    expect(res.status).toBe(403);
  });

  it('successfully transfers between two accounts', async () => {
    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ fromAccountId: accountA.id, toAccountNumber: accountB.account_number, amount: 300, description: 'Rent' });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe('TRANSFER_OUT');

    const bHistory = await request(app)
      .get(`/api/transactions/account/${accountB.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(bHistory.body.transactions.some((t) => t.type === 'TRANSFER_IN')).toBe(true);
  });

  it('returns transaction history for the account owner', async () => {
    const res = await request(app)
      .get(`/api/transactions/account/${accountA.id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });
});
