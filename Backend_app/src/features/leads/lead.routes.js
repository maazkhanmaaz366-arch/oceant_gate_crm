const express = require('express');
const router = express.Router();
const leadController = require('./lead.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.getLeads);
router.post('/', authMiddleware(['Owner', 'Admin', 'Sales']), leadController.createLead);
router.put('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.updateStatus);
router.patch('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.updateStatus);
router.put('/:id/status', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.updateStatus);
router.patch('/:id/status', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.updateStatus);
router.post('/:id/convert', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.convertLead);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), leadController.deleteLead);

module.exports = router;
