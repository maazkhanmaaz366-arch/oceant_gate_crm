const Job = require('./job.model');

class MongoJobRepository {
  async findAll() {
    return await Job.find()
      .populate({
        path: 'booking_id',
        populate: { path: 'customer_id' }
      })
      .populate('driver_id')
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Job.findById(id)
      .populate({
        path: 'booking_id',
        populate: { path: 'customer_id' }
      })
      .populate('driver_id');
  }

  async create(data) {
    const job = new Job(data);
    return await job.save();
  }

  async update(id, data) {
    return await Job.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Job.findByIdAndDelete(id);
  }
}

module.exports = MongoJobRepository;
