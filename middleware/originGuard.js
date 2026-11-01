// Removes spaces and trailing slashes so "https://site.com/" matches "https://site.com".
const normalize = (value) => String(value || '').trim().replace(/\/+$/, '');

// Reads CLIENT_ORIGIN, which may contain several comma-separated addresses.
function parseAllowedOrigins(raw) {
  return String(raw || 'http://localhost:5173')
    .split(',')
    .map(normalize)
    .filter(Boolean);
}

// CSRF defense for cookie-authenticated requests. Browsers send an Origin header on
// state-changing requests, so a mismatched Origin is blocked.
function originGuard(allowedOrigins) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const origin = req.get('origin');
    if (!origin) return next(); // Non-browser clients such as curl or PowerShell

    if (allowedOrigins.includes(normalize(origin))) return next();

    console.warn(`[security] Blocked ${req.method} ${req.originalUrl} from origin "${origin}". Allowed origins: ${allowedOrigins.join(', ')}`);
    return res.status(403).json({ message: 'Cross-origin request blocked' });
  };
}

module.exports = { originGuard, parseAllowedOrigins };
