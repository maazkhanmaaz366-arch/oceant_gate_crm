require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { connectPostgres, sequelize } = require('./postgresConnection');
const { Payment } = require('./postgresModels');

async function patchPayments() {
  console.log('🔄 Syncing PostgreSQL schema and patching payments...');
  await connectPostgres();

  try {
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL Schema Alter/Sync Completed!');

    const payments = await Payment.findAll();
    console.log(`Found ${payments.length} payments in PostgreSQL.`);

    for (const p of payments) {
      let changed = false;

      if (!p.type) {
        p.type = 'receivable';
        changed = true;
      }
      if (!p.reference) {
        p.reference = `PAY-${p.id.slice(0, 8).toUpperCase()}`;
        changed = true;
      }
      if (!p.status) {
        p.status = 'completed';
        changed = true;
      }

      if (changed) {
        await p.save();
        console.log(`Patched Payment ${p.id}: type=${p.type}, reference=${p.reference}, status=${p.status}`);
      }
    }

    console.log('🎉 Payments patched successfully!');
  } catch (error) {
    console.error('❌ Patching failed:', error);
  } finally {
    process.exit(0);
  }
}

patchPayments();
