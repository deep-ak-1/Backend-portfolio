const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { COOKIE_NAME } = require('../middleware/auth');
const { clean } = require('../utils/sanitize');

// Compared against when the email is unknown so response timing does not reveal valid accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', 12);

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});

async function login(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      return res.status(500).json({
        message: 'Server misconfigured: set JWT_SECRET (32+ characters) in server/.env and restart the API',
      });
    }

    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 200) : '';
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).select('+passwordHash');
    const passwordOk = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
    if (!admin || !passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: String(admin._id), email: admin.email, role: 'admin' },
      secret,
      { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.json({ admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(401).json({ message: 'Session is no longer valid' });
    res.json({ admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ message: 'Logged out' });
}

module.exports = { login, me, logout };
