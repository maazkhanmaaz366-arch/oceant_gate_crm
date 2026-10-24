const express = require('express');
const router = express.Router();
const metaController = require('./meta.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/auth', authMiddleware(['Owner', 'Admin']), metaController.getAuthUrl);
router.get('/auth/callback', metaController.authCallback);
router.get('/accounts', authMiddleware(['Owner', 'Admin']), metaController.getAccounts);
router.post('/campaigns', authMiddleware(['Owner', 'Admin', 'Sales']), metaController.createCampaign);
router.get('/reporting', authMiddleware(['Owner', 'Admin', 'Sales', 'Accounts', 'Guest']), metaController.getReporting);

module.exports = router;
