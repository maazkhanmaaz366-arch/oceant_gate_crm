const { Booking, Customer } = require('../../db/postgresModels');

class PostgresBookingRepository {
  async findAll() {
    return await Booking.findAll({
      include: [Customer],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(id) {
    return await Booking.findByPk(id, { include: [Customer] });
  }

  async create(data) {
    return await Booking.create(data);
  }

  async update(id, data) {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    return await booking.update(data);
  }

  async delete(id) {
    const booking = await Booking.findByPk(id);
    if (!booking) return null;
    await booking.destroy();
    return true;
  }
}

module.exports = PostgresBookingRepository;
