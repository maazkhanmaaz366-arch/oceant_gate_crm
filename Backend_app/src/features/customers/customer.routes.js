const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), customerController.getCustomers);
router.post('/', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), customerController.createCustomer);
router.put('/:id', authMiddleware(['Owner', 'Admin', 'Sales']), customerController.updateCustomer);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), customerController.deleteCustomer);

module.exports = router;
