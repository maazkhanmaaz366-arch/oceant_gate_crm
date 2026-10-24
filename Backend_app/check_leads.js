const mongoose = require('mongoose');
require('dotenv').config();

async function checkLeads() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    const Lead = mongoose.model('Lead', new mongoose.Schema({ customer_id: { type: mongoose.Schema.Types.ObjectId }, status: String, source_details: Object }, { strict: false }));
    
    const leads = await Lead.find();
    console.log(`Found ${leads.length} leads.`);
    leads.forEach(l => {
      console.log(`- Lead: ${l.source_details?.name} | Status: ${l.status} | CustomerID: ${l.customer_id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkLeads();
