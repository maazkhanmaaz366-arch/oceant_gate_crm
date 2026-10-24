const paymentService = require('./payment.service');

class PaymentController {
  async getPayments(req, res, next) {
    try {
      const payments = await paymentService.getPayments();
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req, res, next) {
    try {
      const { amount, type, method, booking_id, customer_id, supplier_id, currency, reference } = req.body;
      if (!amount || !type || !method) {
        return res.status(400).json({ success: false, message: 'amount, type, and method are required.' });
      }

      const newPayment = await paymentService.recordPayment(req.body);
      res.status(201).json({ success: true, data: newPayment });
    } catch (error) {
      next(error);
    }
  }

  async updatePayment(req, res, next) {
    try {
      const { status } = req.body;
      const updatedPayment = await paymentService.updatePaymentStatus(req.params.id, status);
      if (!updatedPayment) return res.status(404).json({ success: false, message: 'Payment not found' });
      res.json({ success: true, data: updatedPayment });
    } catch (error) {
      next(error);
    }
  }

  async deletePayment(req, res, next) {
    try {
      const success = await paymentService.deletePayment(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Payment not found' });
      res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
