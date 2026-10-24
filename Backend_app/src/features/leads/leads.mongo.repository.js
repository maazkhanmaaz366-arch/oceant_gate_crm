const Lead = require('./lead.model');

class MongoLeadRepository {
  async findAll() {
    return await Lead.find().populate('customer_id').sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Lead.findById(id);
  }

  async create(data) {
    const lead = new Lead(data);
    return await lead.save();
  }

  async update(id, data) {
    return await Lead.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id) {
    return await Lead.findByIdAndDelete(id);
  }
}

module.exports = MongoLeadRepository;
