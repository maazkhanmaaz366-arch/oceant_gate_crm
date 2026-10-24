const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  nationality: { type: String },
  date_of_birth: { type: Date },
  dietary_requirements: { type: String, default: 'None' },
  medical_conditions: { type: String, default: 'None' },
  emergency_contact: { type: Object, default: { name: '', phone: '', relationship: '' } },
  preferences: { type: Object, default: {} }, // JSONB equivalent
  notes: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
