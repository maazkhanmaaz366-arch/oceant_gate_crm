const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  type: { type: String, enum: ['driver', 'supplier', 'partner'], default: 'driver' },
  vehicle_details: { type: Object, default: {} },
  availability_schedule: { type: Object, default: {} },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  rating: { type: Number, min: 0, max: 5 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
