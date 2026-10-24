const DatabaseFactory = require('../../db/dbFactory');

class PaymentService {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      this._repo = DatabaseFactory.getRepository('payments');
    }
    return this._repo;
  }

  async getPayments() {
    return await this.repo.findAll();
  }

  async recordPayment(data) {
    // Basic idempotency check (Page 27)
    if (data.referenceId) {
      const existing = await this.repo.findByReference(data.referenceId);
      if (existing) {
        return existing; // Return the already processed payment
      }
    }
    return await this.repo.create(data);
  }

  async updatePaymentStatus(id, status) {
    return await this.repo.update(id, { status });
  }

  async deletePayment(id) {
    return await this.repo.delete(id);
  }
}

module.exports = new PaymentService();
