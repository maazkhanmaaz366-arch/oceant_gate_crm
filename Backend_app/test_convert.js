const mongoose = require('mongoose');
require('dotenv').config();
const LeadService = require('./src/features/leads/lead.service');
const Customer = require('./src/features/customers/customer.model');
const Booking = require('./src/features/bookings/booking.model');
const Lead = require('./src/features/leads/lead.model');

async function testConvert() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    
    // Grab a random confirmed lead that doesn't have a customer_id
    const lead = await Lead.findOne({ status: 'confirmed', customer_id: { $exists: false } });
    if (!lead) {
      console.log("No unconverted confirmed leads found to test!");
      process.exit(0);
    }
    
    console.log("Testing convert for lead:", lead._id);
    
    // Simulate what the controller sends
    const data = {
      customer: {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone: "12345"
      },
      booking: {
        service_type: lead.service_interest || 'General Travel'
      }
    };
    
    const result = await LeadService.convertLead(lead._id, data, { _id: new mongoose.Types.ObjectId() });
    console.log("Success!", result);
    process.exit(0);
  } catch (err) {
    console.error("CONVERT FAILED:", err.message);
    process.exit(1);
  }
}
testConvert();
