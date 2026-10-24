const mongoose = require('mongoose');
const User = require('./src/features/auth/auth.model');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oceangate');
    const existing = await User.findOne({ email: 'owner@oceangate.com' });
    if (!existing) {
      await User.create({
        name: 'OceanGate Owner',
        email: 'owner@oceangate.com',
        password_hash: 'admin123',
        role: 'Owner'
      });
      console.log('✅ Owner account created: owner@oceangate.com / admin123');
    } else {
      console.log('ℹ️ Owner account already exists.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
