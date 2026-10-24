const { Driver } = require('../../db/postgresModels');

class PostgresDriverRepository {
  async findAll() {
    return await Driver.findAll({ order: [['createdAt', 'DESC']] });
  }

  async findById(id) {
    return await Driver.findByPk(id);
  }

  async create(data) {
    return await Driver.create(data);
  }

  async update(id, data) {
    const driver = await Driver.findByPk(id);
    if (!driver) return null;
    return await driver.update(data);
  }
}

module.exports = PostgresDriverRepository;
