const { connectPostgres } = require('./postgresConnection');

class DatabaseFactory {
  static async initialize() {
    await connectPostgres();
  }
  
  static getRepository(featureName) {
    try {
      const repos = {
        bookings: require('../features/bookings/bookings.postgres.repository'),
        leads: require('../features/leads/leads.postgres.repository'),
        customers: require('../features/customers/customers.postgres.repository'),
        jobs: require('../features/jobs/jobs.postgres.repository'),
        payments: require('../features/payments/payments.postgres.repository'),
        campaigns: require('../features/campaigns/campaign.postgres.repository'),
        assets: require('../features/assets/asset.postgres.repository'),
        drivers: require('../features/drivers/drivers.postgres.repository'),
      };
      const Repo = repos[featureName];
      if (!Repo) throw new Error(`Repository for ${featureName} not found`);
      return new Repo();
    } catch (error) {
      console.error(`Error loading postgres repository for ${featureName}:`, error);
      throw error;
    }
  }
}

module.exports = DatabaseFactory;
