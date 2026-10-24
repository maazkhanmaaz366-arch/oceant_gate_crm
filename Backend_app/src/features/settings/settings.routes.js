const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');

// Note: In a fully authenticated system, these routes would have admin-only middleware.
router.get('/env', settingsController.getEnv);
router.post('/env', settingsController.updateEnv);

module.exports = router;
