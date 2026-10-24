const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/dashboard', authMiddleware(['Owner', 'Admin', 'Sales', 'Accounts', 'Marketing', 'Guest']), analyticsController.getDashboardMetrics);

module.exports = router;
