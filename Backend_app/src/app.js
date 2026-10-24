const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const bookingRoutes = require('./features/bookings/booking.routes');
const leadRoutes = require('./features/leads/lead.routes');
const customerRoutes = require('./features/customers/customer.routes');
const jobRoutes = require('./features/jobs/job.routes');
const paymentRoutes = require('./features/payments/payment.routes');
const marketingRoutes = require('./features/marketing/marketing.routes');
const oauthRoutes = require('./features/marketing/oauth.routes');
const aiRoutes = require('./features/ai/ai.routes');
const campaignRoutes = require('./features/campaigns/campaign.routes');
const assetRoutes = require('./features/assets/asset.routes');
const authRoutes = require('./features/auth/auth.routes');
const driverRoutes = require('./features/drivers/driver.routes');
const documentRoutes = require('./features/documents/document.routes');
const webhookRoutes = require('./features/webhooks/webhook.routes');
const metaRoutes = require('./features/meta/meta.routes');
const googleRoutes = require('./features/google/google.routes');
const tiktokRoutes = require('./features/tiktok/tiktok.routes');
const analyticsRoutes = require('./features/analytics/analytics.routes');
const automationRoutes = require('./features/automation/automation.routes');

// Import automation scheduler
const scheduler = require('./features/automation/automation');

const app = express();

app.use(cors());
app.use(express.json());

const contentPostRoutes = require('./features/marketing/contentPost.routes');
const settingsRoutes = require('./features/settings/settings.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/content-posts', contentPostRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/tiktok', tiktokRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/settings', settingsRoutes);

const path = require('path');
const distPath = path.join(__dirname, '../../frontend_app/dist');

// Serve compiled frontend files
app.use(express.static(distPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// Universal SPA fallback for all frontend client routes (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start background automation jobs
scheduler.start();

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
