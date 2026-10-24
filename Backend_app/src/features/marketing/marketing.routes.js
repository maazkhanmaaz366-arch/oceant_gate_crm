const express = require('express');
const router = express.Router();
const marketingController = require('./marketing.controller');

router.get('/dashboard', marketingController.getDashboard);
router.post('/push', marketingController.pushCampaign);
router.post('/simulate-conversion', marketingController.simulateConversion);

module.exports = router;
