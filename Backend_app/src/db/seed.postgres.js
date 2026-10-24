/**
 * Seed Script: Creates default admin users in PostgreSQL.
 * Run once with: node src/db/seed.postgres.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
process.env.DB_TYPE = 'postgres';

const bcrypt = require('bcryptjs');
const { sequelize, connectPostgres } = require('./postgresConnection');

async function seed() {
  await connectPostgres();

  const { User } = require('./postgresModels');

  // Check if admin already exists
  const existing = await User.findOne({ where: { email: 'admin@oceangate.ae' } });
  if (existing) {
    console.log('✅ Admin user already exists, skipping seed.');
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('admin123', salt);

  await User.create({
    name: 'Demo Admin',
    email: 'admin@oceangate.ae',
    password: hashed,
    role: 'admin'
  });

  console.log('✅ Default admin created: admin@oceangate.ae / admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
