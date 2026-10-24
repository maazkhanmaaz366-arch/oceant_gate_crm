const { Lead, Customer } = require('../../db/postgresModels');

class PostgresLeadRepository {
  async findAll() {
    return await Lead.findAll({
      include: [Customer],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id) {
    return await Lead.findByPk(id, { include: [Customer] });
  }

  async create(data) {
    return await Lead.create(data);
  }

  async update(id, data) {
    const lead = await Lead.findByPk(id);
    if (!lead) return null;
    return await lead.update(data);
  }

  async delete(id) {
    const lead = await Lead.findByPk(id);
    if (!lead) return null;
    await lead.destroy();
    return true;
  }
}

module.exports = PostgresLeadRepository;
