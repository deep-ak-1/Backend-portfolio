const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { originGuard } = require('./middleware/originGuard');

const app = express();

// Cleaned allowed origins list (guaranteed no trailing slashes)
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'https://deepak-s-portfli0-0fficial.vercel.app')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 1. CORS MUST be registered first so preflight OPTIONS requests pass instantly
app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests, Postman, or matches from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

// 2. Place originGuard AFTER cors so it doesn't block preflight headers or valid API requests
if (typeof originGuard === 'function') {
  app.use(originGuard(allowedOrigins));
}

// Data routes return a clear 503 instead of hanging when MongoDB is not connected.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: 'Database unavailable. Confirm MongoDB is running and MONGODB_URI in server/.env is correct, then restart the API.',
  });
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running successfully',
    documentation: '/api'
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
