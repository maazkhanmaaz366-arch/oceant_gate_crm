const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    const db = mongoose.connection.db;
    
    // Drop the old camelCase index that is crashing things
    try {
      await db.collection('bookings').dropIndex('bookingNumber_1');
      console.log("Dropped old bookingNumber_1 index!");
    } catch (e) {
      console.log("Index bookingNumber_1 not found or already dropped.");
    }
    
    // Also drop the old customer_id in case there are duplicates
    try {
      await db.collection('bookings').dropIndex('customerId_1');
    } catch(e) {}
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixIndexes();
