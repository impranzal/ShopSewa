const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[ShopSewa] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ShopSewa] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
