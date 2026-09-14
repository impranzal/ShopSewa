// Local/traditional-host entry point (Render, Railway, your own machine).
// Vercel does NOT use this file — see api/index.js instead.
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[ShopSewa] Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error(`[ShopSewa] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });
