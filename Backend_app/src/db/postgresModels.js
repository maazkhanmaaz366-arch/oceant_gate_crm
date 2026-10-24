const { DataTypes } = require('sequelize');
const { sequelize } = require('./postgresConnection');

// 1. Auth Model (Users/Admins)
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'sales' },
  name: { type: DataTypes.STRING }
});

// 2. Customer Model
const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING, defaultValue: 'B2C' },
  date_of_birth: { type: DataTypes.DATE },
  nationality: { type: DataTypes.STRING },
  dietary_requirements: { type: DataTypes.STRING },
  medical_conditions: { type: DataTypes.STRING },
  emergency_contact: { type: DataTypes.JSONB, defaultValue: {} }
});

// 3. Lead Model
const Lead = sequelize.define('Lead', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  source: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'new' },
  service_interest: { type: DataTypes.STRING },
  source_details: { type: DataTypes.JSONB, defaultValue: {} },
  travel_dates: { type: DataTypes.JSONB, defaultValue: {} },
  pax: { type: DataTypes.JSONB, defaultValue: {} },
  status_history: { type: DataTypes.JSONB, defaultValue: [] }
});

// 4. Booking Model
const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  booking_number: { type: DataTypes.STRING, unique: true },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  service_type: { type: DataTypes.STRING },
  service_date: { type: DataTypes.DATE },
  pickup_location: { type: DataTypes.STRING },
  dropoff_location: { type: DataTypes.STRING },
  hotel_name: { type: DataTypes.STRING },
  room_type: { type: DataTypes.STRING },
  flight_details: { type: DataTypes.JSONB, defaultValue: {} },
  passengers: { type: DataTypes.JSONB, defaultValue: { adults: 1, children: 0, infants: 0 } },
  customer_price: { type: DataTypes.FLOAT, defaultValue: 0 },
  supplier_cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  currency: { type: DataTypes.STRING, defaultValue: 'AED' },
  payment_status: { type: DataTypes.STRING, defaultValue: 'unpaid' }
}, {
  hooks: {
    beforeValidate: (booking) => {
      if (!booking.booking_number) {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        booking.booking_number = `BK-${datePart}-${randomPart}`;
      }
    }
  }
});

// 5. Job (Operations) Model
const Job = sequelize.define('Job', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  date: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT }
});

// 6. Driver Model
const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  vehicle_type: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' }
});

// 7. Payment Model
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'AED' },
  type: { type: DataTypes.STRING, defaultValue: 'receivable' },
  method: { type: DataTypes.STRING, defaultValue: 'cash' },
  status: { type: DataTypes.STRING, defaultValue: 'completed' },
  reference: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT }
});

// 8. Campaign Model
const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  platform: { type: DataTypes.STRING, defaultValue: 'Meta' },
  status: { type: DataTypes.STRING, defaultValue: 'Draft' },
  budget: { type: DataTypes.FLOAT, defaultValue: 0 },
  spend: { type: DataTypes.FLOAT, defaultValue: 0 },
  objective: { type: DataTypes.STRING },
  offer_title: { type: DataTypes.STRING },
  target_audience: { type: DataTypes.STRING },
  target_origin: { type: DataTypes.STRING },
  target_destination: { type: DataTypes.STRING },
  travel_start_date: { type: DataTypes.DATE },
  travel_end_date: { type: DataTypes.DATE },
  channels: { type: DataTypes.JSONB, defaultValue: [] },
  ai_creative: { type: DataTypes.JSONB, defaultValue: {} }
});

// 9. Asset Model
const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  url: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'image' },
  name: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  source: { type: DataTypes.STRING, defaultValue: 'AI' },
  tags: { type: DataTypes.JSONB, defaultValue: [] },
  dimensions: { type: DataTypes.STRING },
  owner: { type: DataTypes.STRING, defaultValue: 'System' }
});

// 10. Connection Model
const Connection = sequelize.define('Connection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  platform: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'disconnected' },
  credentials: { type: DataTypes.JSONB, defaultValue: {} }
});

// 11. Integration Model
const Integration = sequelize.define('Integration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  api_key: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// --- NEW AI ARCHITECTURE TABLES ---

// 12. AI Generations Log
const AiGeneration = sequelize.define('AiGeneration', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  prompt_hash: { type: DataTypes.STRING },
  model_used: { type: DataTypes.STRING },
  tokens_used: { type: DataTypes.INTEGER },
  output: { type: DataTypes.TEXT }
});

// 13. Audit Log
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  agent_email: { type: DataTypes.STRING },
  action_type: { type: DataTypes.STRING },
  ai_generation_id: { type: DataTypes.UUID }
});

// 14. ContentPost Model (Content Calendar)
const ContentPost = sequelize.define('ContentPost', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  platform: { type: DataTypes.STRING, defaultValue: 'Meta' }, // Meta, Instagram, TikTok, Google, LinkedIn, YouTube
  scheduled_date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Scheduled' }, // Draft, Scheduled, Published, Failed
  media_url: { type: DataTypes.TEXT },
  hashtags: { type: DataTypes.JSONB, defaultValue: [] },
  author: { type: DataTypes.STRING, defaultValue: 'Marketing Team' },
  engagement: { type: DataTypes.JSONB, defaultValue: { likes: 0, comments: 0, shares: 0, reach: 0 } },
  campaign_id: { type: DataTypes.UUID, allowNull: true }
});

// --- RELATIONSHIPS ---
Lead.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'SET NULL' });
Customer.hasMany(Lead, { foreignKey: 'customer_id' });

Booking.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'SET NULL' });
Customer.hasMany(Booking, { foreignKey: 'customer_id' });

Booking.belongsTo(Lead, { foreignKey: 'lead_id', onDelete: 'SET NULL' });

Job.belongsTo(Booking, { foreignKey: 'booking_id', onDelete: 'SET NULL' });
Booking.hasMany(Job, { foreignKey: 'booking_id' });

Job.belongsTo(Driver, { foreignKey: 'driver_id', onDelete: 'SET NULL' });
Driver.hasMany(Job, { foreignKey: 'driver_id' });

Payment.belongsTo(Booking, { foreignKey: 'booking_id', onDelete: 'SET NULL' });
Booking.hasMany(Payment, { foreignKey: 'booking_id' });

Payment.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'SET NULL' });
Customer.hasMany(Payment, { foreignKey: 'customer_id' });

ContentPost.belongsTo(Campaign, { foreignKey: 'campaign_id', onDelete: 'SET NULL' });

module.exports = {
  User, Customer, Lead, Booking, Job, Driver, Payment, 
  Campaign, Asset, Connection, Integration, 
  AiGeneration, AuditLog, ContentPost
};
