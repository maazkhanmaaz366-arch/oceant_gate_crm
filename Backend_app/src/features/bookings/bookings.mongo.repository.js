const Booking = require('./booking.model');

class MongoBookingRepository {
  async findAll() {
    return await Booking.find().populate('customer_id').sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Booking.findById(id).populate('customer_id');
  }

  async create(data) {
    const booking = new Booking(data);
    return await booking.save();
  }

  async update(id, data) {
    return await Booking.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id) {
    return await Booking.findByIdAndDelete(id);
  }
}

module.exports = MongoBookingRepository;
