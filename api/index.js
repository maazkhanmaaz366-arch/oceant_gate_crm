let app;
let initError = null;

try {
  app = require('../Backend_app/src/app');
  const dbFactory = require('../Backend_app/src/db/dbFactory');
  dbFactory.initialize().catch(err => {
    console.error('Database connection notice:', err.message);
  });
} catch (e) {
  initError = {
    message: e.message,
    stack: e.stack,
    code: e.code
  };
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: 'Backend initialization failed',
      details: initError
    });
  }

  return app(req, res);
};
