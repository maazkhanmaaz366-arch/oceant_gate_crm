const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  booking_number: { type: String, unique: true, required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  service_type: { type: String, required: true },
  service_date: { type: Date, required: true },
  pickup_location: { type: String, required: true },
  dropoff_location: { type: String, required: true },
  hotel_name: { type: String },
  room_type: { type: String },
  flight_details: { type: Object, default: { arrival: { flight_no: '', time: '', terminal: '' }, departure: { flight_no: '', time: '', terminal: '' } } },
  passengers: { type: Object, default: { adults: 1, children: 0, infants: 0, names: [] } },
  guide_language_preference: { type: String, default: 'English' },
  itinerary_notes: { type: String },
  customer_price: { type: Number, required: true, default: 0 },
  supplier_cost: { type: Number, default: 0 },
  payment_status: { type: String, enum: ['pending', 'partial', 'paid', 'refunded'], default: 'pending' },
  status: { 
    type: String, 
    enum: ['draft', 'pending_confirmation', 'confirmed', 'assigned', 'in_progress', 'completed', 'closed', 'cancelled'],
    default: 'draft'
  },
  cancellation_reason: { type: String },
  assigned_driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate booking number before saving if not present
bookingSchema.pre('validate', function() {
  if (!this.booking_number) {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    this.booking_number = `BK-${datePart}-${randomPart}`;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
