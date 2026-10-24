const { Sequelize } = require('sequelize');

const postgresUri = process.env.POSTGRES_URI || 'postgresql://neondb_owner:npg_BCAr2yJQWv4o@ep-proud-queen-azore273.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sequelize = new Sequelize(postgresUri, {
  dialect: 'postgres',
  dialectModule: require('pg'),
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
    
    // Require models so they register with sequelize
    require('./postgresModels');

    // Skip heavy table schema introspection/alter in serverless to avoid Vercel 10s timeout
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true }); 
      console.log('🐘 PostgreSQL Models Synced!');
    }
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
  }
};

module.exports = { sequelize, connectPostgres };
