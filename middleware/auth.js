const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'portfolio_admin';

// Reads and verifies the admin session cookie. Returns null when absent or invalid.
function readAdmin(req) {
  const token = req.cookies?.[COOKIE_NAME];
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') return null;
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

// Enforced on every admin-only route on the server. Frontend route guards are a UX
// convenience only and are never the security boundary.
function requireAdmin(req, res, next) {
  const admin = readAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: 'Administrator authentication required' });
  }
  req.admin = admin;
  next();
}

module.exports = { COOKIE_NAME, readAdmin, requireAdmin };
