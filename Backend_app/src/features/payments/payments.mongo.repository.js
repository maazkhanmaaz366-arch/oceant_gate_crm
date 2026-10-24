const Payment = require('./payment.model');

class MongoPaymentRepository {
  async findAll() {
    return await Payment.find()
      .populate('booking_id')
      .populate('customer_id')
      .populate('supplier_id')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Payment.findById(id)
      .populate('booking_id')
      .populate('customer_id')
      .populate('supplier_id');
  }

  async findByReference(referenceId) {
    return await Payment.findOne({ referenceId });
  }

  async create(data) {
    const payment = new Payment(data);
    return await payment.save();
  }

  async update(id, data) {
    return await Payment.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Payment.findByIdAndDelete(id);
  }
}

module.exports = MongoPaymentRepository;
