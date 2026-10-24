const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Get bookings (Accessible by Owner, Admin, Sales, Operations, Read-only)
router.get('/', authMiddleware(['Owner', 'Admin', 'Sales', 'Operations', 'Read-only', 'Guest']), bookingController.getBookings);

// Create booking (Accessible by Owner, Admin, Sales, Operations)
router.post('/', authMiddleware(['Owner', 'Admin', 'Sales', 'Operations', 'Guest']), bookingController.createBooking);

// Update booking (Accessible by Owner, Admin, Sales, Operations)
router.put('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Operations']), bookingController.updateBooking);

// Delete booking (Accessible by Owner, Admin, Sales, Operations, Guest)
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Sales', 'Operations', 'Guest']), bookingController.deleteBooking);

module.exports = router;
