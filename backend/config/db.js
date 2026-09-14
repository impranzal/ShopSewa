const mongoose = require('mongoose');

// Serverless functions can receive many concurrent invocations on a single
// warm instance; without this cache, each request would try to open its own
// MongoDB connection and quickly exhaust Atlas's connection limit.
let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  // Serverless function timeouts are short (Vercel's free tier is 10s), so
  // fail fast instead of using Mongoose's default ~30s server-selection
  // retry window — a hung connection attempt is worse than a clear error.
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });
  isConnected = true;
  console.log(`[ShopSewa] MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
