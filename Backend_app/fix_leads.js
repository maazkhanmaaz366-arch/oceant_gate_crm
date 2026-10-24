const mongoose = require('mongoose');
require('dotenv').config();
async function fixLeads() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    const Lead = mongoose.model('Lead', new mongoose.Schema({ customer_id: { type: mongoose.Schema.Types.ObjectId } }, { strict: false }));
    await Lead.updateMany({}, { $unset: { customer_id: 1 } });
    console.log("Fixed corrupted leads!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixLeads();
