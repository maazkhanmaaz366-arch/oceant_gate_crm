const DatabaseFactory = require('../../db/dbFactory');

class CustomerService {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      this._repo = DatabaseFactory.getRepository('customers');
    }
    return this._repo;
  }

  async getCustomers() {
    return await this.repo.findAll();
  }

  async createCustomer(data) {
    return await this.repo.create(data);
  }

  async updateCustomer(id, data) {
    return await this.repo.update(id, data);
  }

  async deleteCustomer(id) {
    return await this.repo.delete(id);
  }
}

module.exports = new CustomerService();
