const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/booking/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Operations', 'Guest']), documentController.generateBookingPDF);
router.get('/job/:id', authMiddleware(['Owner', 'Admin', 'Operations', 'Guest']), documentController.generateJobPDF);
router.get('/quotation/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Guest']), documentController.generateQuotationPDF);

module.exports = router;
