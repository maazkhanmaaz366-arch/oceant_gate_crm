require('dotenv').config();
const app = require('./src/app');
const dbFactory = require('./src/db/dbFactory');
const contentScheduler = require('./src/features/marketing/contentScheduler.service');

app.use('/api/drivers', require('./src/features/drivers/driver.routes'));
app.use('/api/google', require('./src/features/google/google.routes'));

const PORT = process.env.PORT || 5000;

// Initialize Database before starting the server
dbFactory.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Launch autonomous content publisher daemon
      contentScheduler.startScheduler();
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database. Server not started.', err);
    process.exit(1);
  });
