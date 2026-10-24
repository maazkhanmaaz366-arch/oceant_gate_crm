const { Job, Booking, Customer, Driver } = require('../../db/postgresModels');

class PostgresJobRepository {
  async findAll() {
    return await Job.findAll({
      include: [
        { model: Booking, include: [Customer] },
        Driver
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id) {
    return await Job.findByPk(id, {
      include: [
        { model: Booking, include: [Customer] },
        Driver
      ]
    });
  }

  async create(data) {
    return await Job.create(data);
  }

  async update(id, data) {
    const job = await Job.findByPk(id);
    if (!job) return null;
    return await job.update(data);
  }

  async delete(id) {
    const job = await Job.findByPk(id);
    if (!job) return null;
    await job.destroy();
    return true;
  }
}

module.exports = PostgresJobRepository;
