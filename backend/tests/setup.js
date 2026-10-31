process.env.NODE_ENV = 'test';
process.env.DB_PATH = './data/test.db';
process.env.JWT_SECRET = 'test-secret-key-not-for-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-not-for-production';
process.env.JWT_EXPIRES_IN = '15m';
process.env.LOGIN_RATE_LIMIT_MAX = '1000'; // avoid rate limiting during test runs
process.env.RATE_LIMIT_MAX = '1000';

const fs = require('fs');
// Clean slate for each test run
['./data/test.db', './data/test.db-wal', './data/test.db-shm'].forEach((f) => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
