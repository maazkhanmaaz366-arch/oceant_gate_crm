const express = require('express');
const router = express.Router();
const campaignController = require('./campaign.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), campaignController.createCampaign);
router.get('/', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), campaignController.getCampaigns);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), campaignController.deleteCampaign);

module.exports = router;
