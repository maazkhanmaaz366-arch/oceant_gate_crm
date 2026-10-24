const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('🐘 PostgreSQL connected successfully via Sequelize');
    
    // Require models so they register with sequelize before sync
    require('./postgresModels');

    // We will sync models later after defining them
    await sequelize.sync({ alter: true }); 
    console.log('🐘 PostgreSQL Models Synced!');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
  }
};

module.exports = { sequelize, connectPostgres };
