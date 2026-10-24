const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  category: { type: String, default: 'Uncategorized' },
  source: { type: String, default: 'Manual' },
  campaignId: { type: String },
  tags: [{ type: String }],
  dimensions: { type: String },
  owner: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MediaAsset', assetSchema);
