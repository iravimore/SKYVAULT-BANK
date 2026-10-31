/* Seeds an admin user and a demo customer with a starting balance.
   Run with: npm run seed */
require('dotenv').config();
const db = require('../config/db');
const userModel = require('../models/userModel');
const accountModel = require('../models/accountModel');
const { hashPassword } = require('./authUtils');

async function seed() {
  const adminEmail = 'admin@skyvault.bank';
  const demoEmail = 'demo@skyvault.bank';

  if (!userModel.getUserByEmail(adminEmail)) {
    const passwordHash = await hashPassword('Admin@12345');
    const admin = userModel.createUser({ fullName: 'System Admin', email: adminEmail, passwordHash, role: 'ADMIN' });
    console.log(`Created admin: ${adminEmail} / Admin@12345 (id: ${admin.id})`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  if (!userModel.getUserByEmail(demoEmail)) {
    const passwordHash = await hashPassword('Demo@12345');
    const demo = userModel.createUser({ fullName: 'Rahul Sharma', email: demoEmail, passwordHash, role: 'CUSTOMER' });
    const account = accountModel.createAccount({ userId: demo.id, accountType: 'SAVINGS', openingBalance: 8550000 });
    console.log(`Created demo customer: ${demoEmail} / Demo@12345`);
    console.log(`Demo account number: ${account.account_number}, balance: ₹85,500`);
  } else {
    console.log('Demo customer already exists, skipping.');
  }
}

seed()
  .then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
