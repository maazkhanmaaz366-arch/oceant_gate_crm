const PDFDocument = require('pdfkit');
const { Booking, Customer, Job, Driver } = require('../../db/postgresModels');

class DocumentController {
  async generateBookingPDF(req, res, next) {
    try {
      const booking = await Booking.findByPk(req.params.id, {
        include: [Customer]
      });
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      const customer = booking.Customer || {};
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Booking_${booking.booking_number || booking.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(25).fillColor('#00AEEF').text('OceanGate Travel & Tours', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).fillColor('black').text('Booking Confirmation', { align: 'center', underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`Booking Reference: ${booking.booking_number || booking.id}`);
      doc.text(`Service Date: ${booking.service_date ? new Date(booking.service_date).toLocaleDateString() : 'N/A'}`);
      doc.text(`Service Type: ${booking.service_type || 'General Service'}`);
      doc.moveDown();
      
      doc.text(`Customer Name: ${customer.first_name || ''} ${customer.last_name || ''}`);
      doc.text(`Pickup: ${booking.pickup_location || 'N/A'}`);
      doc.text(`Dropoff: ${booking.dropoff_location || 'N/A'}`);
      doc.moveDown();

      doc.text(`Total Price: $${booking.customer_price || booking.total_price || 0}`);
      doc.text(`Status: ${(booking.status || 'confirmed').toUpperCase()}`);

      doc.end();
    } catch (error) {
      next(error);
    }
  }

  async generateJobPDF(req, res, next) {
    try {
      const job = await Job.findByPk(req.params.id, {
        include: [
          Driver,
          {
            model: Booking,
            include: [Customer]
          }
        ]
      });
      
      if (!job) return res.status(404).json({ message: 'Job not found' });

      const booking = job.Booking || {};
      const driver = job.Driver || {};

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=JobCard_${job.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(25).fillColor('#F7CF32').text('OceanGate Operations', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).fillColor('black').text('OFFICIAL JOB CARD', { align: 'center', underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`Job ID: ${job.id}`);
      doc.text(`Booking Reference: ${booking.booking_number || booking.id || 'N/A'}`);
      doc.text(`Service Date: ${booking.service_date ? new Date(booking.service_date).toLocaleDateString() : 'N/A'}`);
      doc.text(`Assigned Driver: ${driver.name || 'Unassigned'}`);
      doc.moveDown();

      doc.text('--- ITINERARY ---');
      doc.text(`Pickup: ${booking.pickup_location || 'N/A'}`);
      doc.text(`Dropoff: ${booking.dropoff_location || 'N/A'}`);
      doc.text(`Passengers: ${booking.passengers?.count || 1}`);
      
      // Deliberately omitting customer_price for driver view!
      doc.moveDown();
      doc.text('--- OPERATIONAL NOTES ---');
      doc.text(job.notes || job.operational_notes || 'No special instructions.');

      doc.end();
    } catch (error) {
      next(error);
    }
  }

  async generateQuotationPDF(req, res, next) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Quotation_${req.params.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(25).fillColor('#00AEEF').text('OceanGate Travel', { align: 'center' });
      doc.fontSize(16).fillColor('black').text('Official Quotation', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Quotation ID: ${req.params.id}`);
      doc.text('This is an auto-generated quotation template.');
      doc.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
