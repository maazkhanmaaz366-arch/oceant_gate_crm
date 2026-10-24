const customerService = require('./customer.service');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const customers = await customerService.getCustomers();
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const data = req.body;
      if (!data.first_name || !data.last_name || !data.phone) {
        return res.status(400).json({ success: false, message: 'first_name, last_name, and phone are required.' });
      }

      const newCustomer = await customerService.createCustomer(data);
      res.status(201).json({ success: true, data: newCustomer });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body);
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      const success = await customerService.deleteCustomer(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Customer not found' });
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
