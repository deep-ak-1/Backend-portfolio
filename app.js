const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { originGuard, parseAllowedOrigins } = require('./middleware/originGuard');

const app = express();
const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_ORIGIN);

app.disable('x-powered-by');

// Required when hosted behind a proxy (Render, Railway, Heroku, nginx).
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(originGuard(allowedOrigins));

// Data routes return a clear 503 instead of hanging when MongoDB is not connected.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    message: 'Database unavailable. Confirm MongoDB is running and MONGODB_URI is correct, then restart the API.',
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
