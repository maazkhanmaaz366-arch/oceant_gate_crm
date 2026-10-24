const DatabaseFactory = require('../../db/dbFactory');

class JobService {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      this._repo = DatabaseFactory.getRepository('jobs');
    }
    return this._repo;
  }

  async getJobById(id) { return await this.repo.findById(id); }

  async getJobs() {
    return await this.repo.findAll();
  }

  async createJobCard(booking_id, data) {
    return await this.repo.create({ ...data, booking_id });
  }

  async updateJob(id, updateData) {
    updateData.updatedAt = new Date();
    return await this.repo.update(id, updateData);
  }

  async deleteJob(id) {
    return await this.repo.delete(id);
  }
}

module.exports = new JobService();
