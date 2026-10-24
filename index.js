const app = require('./Backend_app/src/app');
const dbFactory = require('./Backend_app/src/db/dbFactory');

let isDbInitialized = false;

// Standalone server mode (when executed directly via `node index.js`)
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, 'Backend_app/.env') });
  require('dotenv').config();
  const PORT = process.env.PORT || 5000;
  dbFactory.initialize()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`OceanGate Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

// Serverless handler export (for Vercel / Cloud functions)
module.exports = async (req, res) => {
  if (!isDbInitialized) {
    try {
      await dbFactory.initialize();
      isDbInitialized = true;
    } catch (err) {
      console.error('Database connection notice:', err.message);
    }
  }
  return app(req, res);
};
