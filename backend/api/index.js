// Vercel serverless entry point. Vercel treats any exported Express app
// (or (req, res) handler) under api/ as a function — app.listen() is never
// called here; Vercel's runtime handles the actual HTTP server.
module.exports = require('../app');
