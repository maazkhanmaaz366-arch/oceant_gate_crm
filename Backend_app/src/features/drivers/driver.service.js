const DatabaseFactory = require('../../db/dbFactory');

class DriverService {
  constructor() {
    this._repo = null;
  }
  
  get repo() {
    if (!this._repo) this._repo = DatabaseFactory.getRepository('drivers');
    return this._repo;
  }

  async getAllDrivers() { return await this.repo.findAll(); }
  async getDriverById(id) { return await this.repo.findById(id); }
  async createDriver(data) { return await this.repo.create(data); }
  async updateDriver(id, data) { return await this.repo.update(id, data); }
  async deleteDriver(id) { return await this.repo.delete(id); }
}

module.exports = new DriverService();
