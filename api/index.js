require('dotenv').config();
const app = require('../Backend_app/src/app');
const dbFactory = require('../Backend_app/src/db/dbFactory');

let isDbInitialized = false;

module.exports = async (req, res) => {
  try {
    // Ensure database is initialized before handling request
    if (!isDbInitialized) {
      try {
        await dbFactory.initialize();
        isDbInitialized = true;
      } catch (err) {
        console.error('PostgreSQL initialization error:', err);
      }
    }
    return app(req, res);
  } catch (err) {
    console.error('Serverless execution error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
