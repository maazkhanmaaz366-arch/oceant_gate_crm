require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { connectPostgres, sequelize } = require('./postgresConnection');
const { Booking } = require('./postgresModels');

async function patchBookings() {
  console.log('🔄 Patching existing Postgres Bookings...');

  await connectPostgres();

  try {
    const bookings = await Booking.findAll();
    for (const b of bookings) {
      let changed = false;
      
      if (!b.booking_number) {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        b.booking_number = `BK-${datePart}-${randomPart}`;
        changed = true;
      }
      
      if (!b.service_date) {
        // Set a default date for old records so UI doesn't crash on "Invalid Date"
        b.service_date = b.createdAt || new Date();
        changed = true;
      }

      if (changed) {
        await b.save();
        console.log(`Patched Booking: ${b.id}`);
      }
    }

    console.log('🎉 Patching Completed Successfully!');
  } catch (error) {
    console.error('❌ Patching failed:', error);
  } finally {
    process.exit(0);
  }
}

patchBookings();
