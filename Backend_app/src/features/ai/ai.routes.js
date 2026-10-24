const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/generate-copy', authMiddleware(['Owner', 'Admin', 'Marketing']), aiController.generateCopy);
router.post('/lead-proposal', authMiddleware(['Owner', 'Admin', 'Sales', 'Marketing']), aiController.generateLeadProposal);
router.post('/translate', authMiddleware(['Owner', 'Admin', 'Sales', 'Marketing', 'Guest']), aiController.translateText);

module.exports = router;
