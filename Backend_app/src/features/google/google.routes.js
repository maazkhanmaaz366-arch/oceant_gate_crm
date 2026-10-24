const express = require('express');
const router = express.Router();
const googleController = require('./google.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/auth', authMiddleware(['Owner', 'Admin']), googleController.getAuthUrl);
router.get('/auth/callback', googleController.authCallback);
router.get('/accounts', authMiddleware(['Owner', 'Admin']), googleController.getAccounts);
router.post('/campaigns', authMiddleware(['Owner', 'Admin', 'Sales']), googleController.createCampaign);
router.get('/reporting', authMiddleware(['Owner', 'Admin', 'Sales', 'Accounts', 'Guest']), googleController.getReporting);

module.exports = router;
