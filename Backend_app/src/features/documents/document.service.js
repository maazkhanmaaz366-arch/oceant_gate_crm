const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class DocumentService {
  constructor() {
    this.storagePath = path.join(__dirname, '../../..', 'storage', 'documents');
  }

  async generateBookingPDF(booking) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `Booking_${booking.booking_number}.pdf`;
        const filePath = path.join(this.storagePath, fileName);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);

        doc.fontSize(25).fillColor('#00AEEF').text('OceanGate Travel & Tours', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('black').text('Booking Confirmation', { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`Booking Reference: ${booking.booking_number}`);
        doc.text(`Service Date: ${new Date(booking.service_date).toLocaleDateString()}`);
        doc.text(`Service Type: ${booking.service_type}`);
        doc.moveDown();
        
        if (booking.customer_id) {
          doc.text(`Customer Name: ${booking.customer_id.first_name} ${booking.customer_id.last_name}`);
        }
        
        doc.text(`Pickup: ${booking.pickup_location}`);
        doc.text(`Dropoff: ${booking.dropoff_location}`);
        doc.moveDown();

        doc.text(`Total Price: $${booking.customer_price}`);
        doc.text(`Status: ${booking.status.toUpperCase()}`);

        doc.end();

        stream.on('finish', () => resolve({ filePath, fileName }));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateJobPDF(job) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `JobCard_${job._id}.pdf`;
        const filePath = path.join(this.storagePath, fileName);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        
        doc.pipe(stream);

        doc.fontSize(25).fillColor('#F7CF32').text('OceanGate Operations', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('black').text('OFFICIAL JOB CARD', { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(12).text(`Job ID: ${job._id}`);
        if (job.booking_id) {
          doc.text(`Booking Reference: ${job.booking_id.booking_number}`);
          doc.text(`Service Date: ${new Date(job.booking_id.service_date).toLocaleDateString()}`);
        }
        doc.text(`Assigned Driver: ${job.driver_id ? job.driver_id.name : 'Unassigned'}`);
        doc.moveDown();

        doc.text('--- ITINERARY ---');
        if (job.booking_id) {
          doc.text(`Pickup: ${job.booking_id.pickup_location}`);
          doc.text(`Dropoff: ${job.booking_id.dropoff_location}`);
          doc.text(`Passengers: ${job.booking_id.passengers?.count || 1}`);
        }
        
        doc.moveDown();
        doc.text('--- OPERATIONAL NOTES ---');
        doc.text(job.operational_notes || 'No special instructions.');

        doc.end();

        stream.on('finish', () => resolve({ filePath, fileName }));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new DocumentService();
