const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Payments can be viewed by Owner, Admin, Accounts
router.get('/', authMiddleware(['Owner', 'Admin', 'Accounts', 'Guest']), paymentController.getPayments);
router.post('/', authMiddleware(['Owner', 'Admin', 'Accounts', 'Guest']), paymentController.recordPayment);
router.put('/:id', authMiddleware(['Owner', 'Admin', 'Accounts']), paymentController.updatePayment);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Accounts', 'Guest']), paymentController.deletePayment);

module.exports = router;
