const Customer = require('./customer.model');

class MongoCustomerRepository {
  async findAll() {
    return await Customer.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Customer.findById(id);
  }

  async create(data) {
    const customer = new Customer(data);
    return await customer.save();
  }

  async update(id, data) {
    return await Customer.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async delete(id) {
    return await Customer.findByIdAndDelete(id);
  }
}

module.exports = MongoCustomerRepository;
