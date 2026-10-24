const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    enum: ['meta', 'google', 'tiktok'], 
    required: true 
  },
  account_id: { type: String, required: true }, // The external ID for the ad account/page
  account_name: { type: String },
  access_token: { type: String, required: true }, // Should be encrypted at rest in production!
  refresh_token: { type: String }, // Should be encrypted at rest in production!
  expires_at: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'error'], default: 'active' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);
