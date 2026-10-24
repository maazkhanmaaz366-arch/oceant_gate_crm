const express = require('express');
const router = express.Router();
const tiktokController = require('./tiktok.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/auth', authMiddleware(['Owner', 'Admin']), tiktokController.getAuthUrl);
router.post('/auth/callback', authMiddleware(['Owner', 'Admin']), tiktokController.authCallback);
router.get('/accounts', authMiddleware(['Owner', 'Admin']), tiktokController.getAccounts);
router.post('/campaigns', authMiddleware(['Owner', 'Admin', 'Sales']), tiktokController.createCampaign);
router.post('/publish', authMiddleware(['Owner', 'Admin', 'Sales']), tiktokController.publishContent);
router.get('/reporting', authMiddleware(['Owner', 'Admin', 'Sales', 'Accounts', 'Guest']), tiktokController.getReporting);

module.exports = router;
