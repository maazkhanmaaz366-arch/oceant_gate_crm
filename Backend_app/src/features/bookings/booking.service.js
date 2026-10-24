const DatabaseFactory = require('../../db/dbFactory');

class BookingService {
  constructor() {
    // Lazily load the repository to ensure DB is connected first
    this._repo = null;
  }

  get repo() {
    if (!this._repo) {
      this._repo = DatabaseFactory.getRepository('bookings');
    }
    return this._repo;
  }

  generateBookingNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BKG-${timestamp}-${random}`;
  }

  async getBookings() {
    return await this.repo.findAll();
  }

  async createBooking(bookingData) {
    const newBooking = {
      ...bookingData,
      booking_number: this.generateBookingNumber(),
      status: bookingData.status || 'draft',
    };
    
    const createdBooking = await this.repo.create(newBooking);

    // AUTOMATION: Create Job Card, Payment, and Documents if not a draft
    if (createdBooking.status !== 'draft') {
      try {
        const jobService = require('../jobs/job.service');
        const job = await jobService.createJobCard(createdBooking._id, {
          driver_id: null,
          status: 'assigned',
          operational_notes: 'Auto-generated from new confirmed booking.'
        });

        const paymentService = require('../payments/payment.service');
        await paymentService.recordPayment({
          booking_id: createdBooking._id,
          customer_id: createdBooking.customer_id,
          amount: createdBooking.customer_price || 0,
          type: 'receivable',
          method: 'cash',
          currency: 'USD',
          status: 'pending',
          reference: `Auto-inv for ${createdBooking.booking_number}`
        });

        // ----------------------------------------------------
        // NEW: Document Automation
        // ----------------------------------------------------
        setTimeout(async () => {
          try {
            const documentService = require('../documents/document.service');
            
            // Generate Booking Confirmation PDF
            const populatedBooking = await this.repo.findById(createdBooking._id).populate('customer_id');
            const bookingDoc = await documentService.generateBookingPDF(populatedBooking);
            console.log(`[DOCS] Generated Booking Confirmation: ${bookingDoc.fileName}`);

            // Generate Job Card PDF
            if (job) {
              const populatedJob = await jobService.repo.findById(job._id).populate('booking_id driver_id');
              const jobDoc = await documentService.generateJobPDF(populatedJob);
              console.log(`[DOCS] Generated Job Card: ${jobDoc.fileName}`);
            }
          } catch (docErr) {
            console.error("Background Document generation failed:", docErr);
          }
        }, 0);

      } catch (autoErr) {
        console.error("Failed to execute booking automations:", autoErr);
      }
    }

    return createdBooking;
  }

  async updateBooking(id, updateData) {
    return await this.repo.update(id, updateData);
  }

  async deleteBooking(id) {
    return await this.repo.delete(id);
  }
}

module.exports = new BookingService();
