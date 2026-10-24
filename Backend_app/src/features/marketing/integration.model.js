const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['meta', 'google', 'tiktok']
  },
  access_token: {
    type: String,
    required: true
  },
  refresh_token: {
    type: String
  },
  expires_at: {
    type: Date
  },
  account_id: {
    type: String
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

// Ensure only one integration per platform exists since this is a single-tenant CRM
integrationSchema.index({ platform: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
