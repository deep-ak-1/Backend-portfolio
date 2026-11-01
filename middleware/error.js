function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed JSON body' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with this unique value already exists' });
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join('; ');
    return res.status(400).json({ message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on the server. Check the API terminal for details.' : err.message,
  });
}

module.exports = { notFound, errorHandler };
