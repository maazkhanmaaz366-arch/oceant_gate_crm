const mongoose = require('mongoose');
require('dotenv').config();

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const bookings = await Booking.find();
    console.log(`Found ${bookings.length} bookings.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkBookings();
