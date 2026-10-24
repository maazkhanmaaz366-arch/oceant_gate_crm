const { Payment, Booking, Customer } = require('../../db/postgresModels');

class PostgresPaymentRepository {
  async findAll() {
    return await Payment.findAll({
      include: [Booking, Customer],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id) {
    return await Payment.findByPk(id, { include: [Booking, Customer] });
  }

  async create(data) {
    return await Payment.create(data);
  }

  async update(id, data) {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    return await payment.update(data);
  }

  async delete(id) {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    await payment.destroy();
    return true;
  }
}

module.exports = PostgresPaymentRepository;
