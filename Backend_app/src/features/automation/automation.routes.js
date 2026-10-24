const express = require('express');
const router = express.Router();
const scheduler = require('./automation');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/jobs', authMiddleware(['Owner', 'Admin']), (req, res) => {
  res.json({ success: true, data: scheduler.getJobsStatus() });
});

router.post('/emergency-pause', authMiddleware(['Owner', 'Admin']), (req, res) => {
  scheduler.stop();
  res.json({ success: true, message: 'ALL BACKGROUND AUTOMATIONS PAUSED. AD CAMPAIGNS HALTED.' });
});

module.exports = router;
