const Driver = require('./driver.model');

class DriverMongoRepository {
  async findAll() { return await Driver.find({}); }
  async findById(id) { return await Driver.findById(id); }
  async create(data) { return await Driver.create(data); }
  async update(id, data) { return await Driver.findByIdAndUpdate(id, data, { new: true }); }
  async delete(id) { return await Driver.findByIdAndDelete(id); }
}

module.exports = DriverMongoRepository;
