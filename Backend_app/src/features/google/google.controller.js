const { Connection } = require('../../db/postgresModels');
const axios = require('axios');

class GoogleController {
  async getAuthUrl(req, res, next) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = 'http://localhost:5000/api/google/auth/callback';
      const scope = 'https://www.googleapis.com/auth/adwords';
      
      if (!clientId) {
        return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID not configured in .env' });
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`;
      res.redirect(authUrl);
    } catch (error) { next(error); }
  }

  async authCallback(req, res, next) {
    try {
      const { code, error: authError } = req.query;

      if (authError) {
        return res.status(400).send(`Authentication Failed: ${authError}`);
      }

      if (!code) {
        return res.status(400).send('No authorization code provided by Google.');
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = 'http://localhost:5000/api/google/auth/callback';

      // 1. Exchange authorization code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // 2. Save tokens securely in PostgreSQL Connection database
      const credentials = {
        account_id: 'pending_customer_id',
        account_name: 'OceanGate Google Ads',
        access_token: access_token,
        refresh_token: refresh_token || 'no_refresh_token_provided',
        expires_at: expires_in ? new Date(Date.now() + expires_in * 1000) : new Date(Date.now() + 3600 * 1000)
      };

      const existing = await Connection.findOne({ where: { platform: 'google' } });
      if (existing) {
        await existing.update({ status: 'active', credentials });
      } else {
        await Connection.create({ platform: 'google', status: 'active', credentials });
      }

      // Return a success page
      res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #0f172a; color: white;">
            <h1 style="color: #4ade80;">Google Ads Connected Successfully! ✅</h1>
            <p>Your OAuth tokens have been securely saved to the PostgreSQL database.</p>
            <p>You may close this window and return to the Command Center.</p>
          </body>
        </html>
      `);

    } catch (error) { 
      console.error('[Google OAuth Error]', error.response?.data || error.message);
      res.status(500).send(`Failed to exchange token. Check server console.`);
    }
  }

  async getAccounts(req, res, next) {
    try {
      res.json({ success: true, data: [{ id: '987-654-3210', name: 'OceanGate Search Ads' }] });
    } catch (error) { next(error); }
  }

  async createCampaign(req, res, next) {
    try {
      res.json({ success: true, message: 'Google campaign created in draft mode', external_id: 'google_camp_001' });
    } catch (error) { next(error); }
  }

  async getReporting(req, res, next) {
    try {
      res.json({ success: true, data: { spend: 890.00, impressions: 15000, clicks: 800, conversions: 22 } });
    } catch (error) { next(error); }
  }
}

module.exports = new GoogleController();
