require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('[config] JWT_SECRET is missing or shorter than 32 characters. Admin login will be refused until it is set in server/.env.');
}

async function start() {
  app.listen(PORT, () => {
    console.log(`[api] Express is listening on ${PORT}`);
  });

  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    console.error('[db] The API is running, but data routes return 503 until MONGODB_URI is fixed. Restart after fixing it.');
  }
}

start();
