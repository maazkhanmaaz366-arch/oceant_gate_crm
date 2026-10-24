const bookingService = require('./booking.service');

class BookingController {
  async getBookings(req, res, next) {
    try {
      const bookings = await bookingService.getBookings();
      res.json({ success: true, data: bookings });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      // Validate incoming data
      const bookingData = req.body;
      if (!bookingData.service_type || !bookingData.customer_id || !bookingData.service_date) {
        return res.status(400).json({ success: false, message: 'service_type, customer_id, and service_date are required.' });
      }

      const newBooking = await bookingService.createBooking(bookingData);
      res.status(201).json({ success: true, data: newBooking });
    } catch (error) {
      next(error);
    }
  }

  async updateBooking(req, res, next) {
    try {
      const updatedBooking = await bookingService.updateBooking(req.params.id, req.body);
      if (!updatedBooking) return res.status(404).json({ success: false, message: 'Booking not found' });
      res.json({ success: true, data: updatedBooking });
    } catch (error) {
      next(error);
    }
  }

  async deleteBooking(req, res, next) {
    try {
      const success = await bookingService.deleteBooking(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Booking not found' });
      res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
