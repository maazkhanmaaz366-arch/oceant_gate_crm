const driverService = require('./driver.service');

class DriverController {
  async getDrivers(req, res, next) {
    try {
      const data = await driverService.getAllDrivers();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getDriver(req, res, next) {
    try {
      const data = await driverService.getDriverById(req.params.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createDriver(req, res, next) {
    try {
      const data = await driverService.createDriver(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateDriver(req, res, next) {
    try {
      const data = await driverService.updateDriver(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async deleteDriver(req, res, next) {
    try {
      await driverService.deleteDriver(req.params.id);
      res.json({ success: true, message: 'Driver deleted' });
    } catch (error) { next(error); }
  }
}

module.exports = new DriverController();
