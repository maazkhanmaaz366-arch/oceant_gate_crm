const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  source: { type: String, required: true, default: 'Manual' }, // Website, WhatsApp, Facebook, Instagram, Referral, Repeat Customer, Manual
  source_details: { type: Object, default: {} }, // campaign info, UTM params
  service_interest: { type: String },
  travel_dates: { type: Object, default: { start_date: null, end_date: null } },
  pax: { type: Object, default: { adults: 1, children: 0, infants: 0 } },
  budget_expectation: { type: Number, default: 0 },
  preferred_accommodation: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'quotation_sent', 'follow_up', 'confirmed', 'lost'],
    default: 'new'
  },
  status_history: [{
    status: String,
    changed_at: { type: Date, default: Date.now },
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  lost_reason: { type: String },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ai_summary: { type: String },
  ai_action: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
