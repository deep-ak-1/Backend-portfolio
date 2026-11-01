// Basic CSRF defense for cookie-authenticated requests. Browsers send an Origin header
// on cross-site and same-origin state-changing requests, so any mismatched Origin is blocked.
// Combined with SameSite=Lax cookies, this covers the usual cross-site form and fetch attacks.
function originGuard(allowedOrigins) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (!origin) return next(); // Non-browser clients such as curl or PowerShell Invoke-RestMethod
    if (allowedOrigins.includes(origin)) return next();
    return res.status(403).json({ message: 'Cross-origin request blocked' });
  };
}

module.exports = { originGuard };
