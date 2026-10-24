const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  objective: { type: String },
  offerTitle: { type: String },
  offerDescription: { type: String },
  targetOrigin: { type: String }, // e.g., UK, Germany
  targetDestination: { type: String }, // e.g., Dubai, Abu Dhabi
  travelStartDate: { type: Date },
  travelEndDate: { type: Date },
  totalBudget: { type: Number },
  channels: [{ type: String }], // Meta, Google, TikTok
  status: { type: String, default: 'Draft' },
  aiCreative: { type: Object }, // Store the generated AI copy and image URL
  owner: { type: String } // internal user ID
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
