const app = require('../Backend_app/src/app');
const dbFactory = require('../Backend_app/src/db/dbFactory');

let isDbInitialized = false;

module.exports = async (req, res) => {
  try {
    if (!isDbInitialized) {
      await dbFactory.initialize();
      isDbInitialized = true;
    }
    return app(req, res);
  } catch (err) {
    console.error('Express serverless error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
