require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// We need both connections
const { sequelize, connectPostgres } = require('./postgresConnection');
const { User, Customer, Lead, Booking, Job, Driver, Payment, Campaign, Asset } = require('./postgresModels');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate';

// Mongoose Models
const MongoUser = require('../features/auth/auth.model');
const MongoCustomer = require('../features/customers/customer.model');
const MongoLead = require('../features/leads/lead.model');
const MongoBooking = require('../features/bookings/booking.model');
const MongoJob = require('../features/jobs/job.model');
const MongoDriver = require('../features/drivers/driver.model');

async function migrate() {
  console.log('🔄 Starting Data Migration from MongoDB to PostgreSQL...');

  // Connect to Mongo
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  // Connect to Postgres
  await connectPostgres();
  
  // Disable foreign key constraints temporarily for bulk inserts if needed
  // await sequelize.query('SET session_replication_role = replica;');

  const idMap = {}; // Maps Mongo _id to Postgres UUID

  try {
    // 1. Migrate Users
    console.log('Migrating Users...');
    const mongoUsers = await MongoUser.find().lean();
    for (const mUser of mongoUsers) {
      // Don't overwrite the admin we already seeded if it exists
      if (mUser.email === 'admin@oceangate.ae') continue;
      
      const newId = uuidv4();
      idMap[mUser._id.toString()] = newId;
      
      await User.create({
        id: newId,
        email: mUser.email,
        password: mUser.password_hash,
        role: mUser.role.toLowerCase(),
        name: mUser.name,
        createdAt: mUser.createdAt,
        updatedAt: mUser.updatedAt
      });
    }

    // 2. Migrate Customers
    console.log('Migrating Customers...');
    const mongoCustomers = await MongoCustomer.find().lean();
    for (const mC of mongoCustomers) {
      const newId = uuidv4();
      idMap[mC._id.toString()] = newId;
      
      await Customer.create({
        id: newId,
        first_name: mC.first_name,
        last_name: mC.last_name,
        email: mC.email,
        phone: mC.phone,
        type: mC.type || 'B2C',
        createdAt: mC.createdAt,
        updatedAt: mC.updatedAt
      });
    }

    // 3. Migrate Leads
    console.log('Migrating Leads...');
    const mongoLeads = await MongoLead.find().lean();
    for (const mL of mongoLeads) {
      const newId = uuidv4();
      idMap[mL._id.toString()] = newId;
      
      const customer_id = mL.customer_id ? idMap[mL.customer_id.toString()] : null;
      
      await Lead.create({
        id: newId,
        customer_id,
        source: mL.source || 'Unknown',
        status: mL.status || 'new',
        service_interest: mL.service_interest,
        source_details: mL.source_details || {},
        travel_dates: mL.travel_dates || {},
        pax: mL.pax || {},
        status_history: mL.status_history || [],
        createdAt: mL.createdAt,
        updatedAt: mL.updatedAt
      });
    }

    // 4. Migrate Bookings
    console.log('Migrating Bookings...');
    const mongoBookings = await MongoBooking.find().lean();
    for (const mB of mongoBookings) {
      const newId = uuidv4();
      idMap[mB._id.toString()] = newId;
      
      const customer_id = mB.customer_id ? idMap[mB.customer_id.toString()] : null;
      const lead_id = mB.lead_id ? idMap[mB.lead_id.toString()] : null;

      await Booking.create({
        id: newId,
        customer_id,
        lead_id,
        status: mB.status || 'draft',
        service_type: mB.service_type,
        total_price: mB.total_price || mB.customer_price || 0,
        currency: 'AED',
        payment_status: mB.payment_status || 'unpaid',
        createdAt: mB.createdAt,
        updatedAt: mB.updatedAt
      });
    }

    // 5. Migrate Drivers
    console.log('Migrating Drivers...');
    const mongoDrivers = await MongoDriver.find().lean();
    for (const mD of mongoDrivers) {
      const newId = uuidv4();
      idMap[mD._id.toString()] = newId;
      
      await Driver.create({
        id: newId,
        name: mD.name,
        phone: mD.phone,
        vehicle_type: mD.vehicle_type,
        status: mD.status,
        createdAt: mD.createdAt,
        updatedAt: mD.updatedAt
      });
    }

    // 6. Migrate Jobs
    console.log('Migrating Jobs...');
    const mongoJobs = await MongoJob.find().lean();
    for (const mJ of mongoJobs) {
      const newId = uuidv4();
      idMap[mJ._id.toString()] = newId;
      
      const booking_id = mJ.booking_id ? idMap[mJ.booking_id.toString()] : null;
      const driver_id = mJ.driver_id ? idMap[mJ.driver_id.toString()] : null;

      await Job.create({
        id: newId,
        booking_id,
        driver_id,
        status: mJ.status || 'pending',
        date: mJ.date || mJ.createdAt,
        notes: mJ.notes || mJ.operational_notes,
        createdAt: mJ.createdAt,
        updatedAt: mJ.updatedAt
      });
    }

    console.log('🎉 Migration Completed Successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // await sequelize.query('SET session_replication_role = DEFAULT;');
    mongoose.connection.close();
    process.exit(0);
  }
}

migrate();
