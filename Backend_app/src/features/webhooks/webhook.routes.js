const express = require('express');
const router = express.Router();
const webhookController = require('./webhook.controller');

// Simple middleware to enforce webhook API key
const verifyWebhookKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(403).json({ success: false, message: 'Forbidden: Invalid or missing API Key' });
  }
  next();
};

router.post('/website-lead', verifyWebhookKey, webhookController.websiteLead);
router.get('/website-lead/health', webhookController.websiteHealth);

module.exports = router;
