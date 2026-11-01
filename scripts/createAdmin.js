// Creates or updates the single administrator account from server/.env values.
// Run with: npm run admin:create   (from the project root)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { connectDB } = require('../config/db');

function fail(message) {
  console.error(`[admin] ${message}`);
  process.exit(1);
}

(async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || 'Administrator').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('ADMIN_EMAIL must be a valid email address in server/.env');
  if (password.length < 12) fail('ADMIN_PASSWORD must be at least 12 characters in server/.env');

  await connectDB(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert keeps exactly one admin for this email. Re-running the script resets the password to the .env value.
  await Admin.findOneAndUpdate(
    { email },
    { email, name, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`[admin] Administrator ready for ${email}. The password is not printed.`);
  console.log('[admin] Delete the ADMIN_PASSWORD line from server/.env now.');
  await mongoose.disconnect();
})().catch((err) => {
  console.error(`[admin] Failed: ${err.message}`);
  process.exit(1);
});
