const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { type: String, enum: ['receivable', 'payable'], required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['cash', 'card', 'bank_transfer', 'payment_link'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'refunded', 'failed'], default: 'completed' },
  reference: { type: String },
  transaction_id: { type: String },
  description: { type: String },
  processed_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
