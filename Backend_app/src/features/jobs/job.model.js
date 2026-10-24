const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', unique: true, required: true },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: { 
    type: String, 
    enum: ['assigned', 'accepted', 'en_route', 'arrived', 'passenger_onboard', 'completed'],
    default: 'assigned'
  },
  status_history: [{
    status: String,
    changed_at: { type: Date, default: Date.now }
  }],
  operational_notes: { type: String },
  started_at: { type: Date },
  completed_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
