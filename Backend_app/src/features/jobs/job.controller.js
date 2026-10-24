const jobService = require('./job.service');

class JobController {
  async getJobs(req, res, next) {
    try {
      const jobs = await jobService.getJobs();
      res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  async createJob(req, res, next) {
    try {
      const { booking_id, driver_id, operational_notes } = req.body;
      if (!booking_id) {
        return res.status(400).json({ success: false, message: 'booking_id is required to create a Job Card.' });
      }

      const newJob = await jobService.createJobCard(booking_id, { driver_id, operational_notes });
      res.status(201).json({ success: true, data: newJob });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req, res, next) {
    try {
      const updatedJob = await jobService.updateJob(req.params.id, req.body);
      if (!updatedJob) return res.status(404).json({ success: false, message: 'Job not found' });
      res.json({ success: true, data: updatedJob });
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const success = await jobService.deleteJob(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Job not found' });
      res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
