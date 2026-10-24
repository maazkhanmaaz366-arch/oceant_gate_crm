const { Connection } = require('../../db/postgresModels');

class TiktokController {
  async getAuthUrl(req, res, next) {
    try {
      const appKey = process.env.TIKTOK_APP_KEY || 'MOCK_APP_KEY';
      const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:5000/api/tiktok/auth/callback';
      const authUrl = `https://open-api.tiktok.com/platform/oauth/connect/?client_key=${appKey}&response_type=code&redirect_uri=${redirectUri}&scope=user.info.basic,video.publish`;
      res.json({ success: true, url: authUrl });
    } catch (error) { next(error); }
  }

  async authCallback(req, res, next) {
    try {
      const credentials = {
        account_id: 'tiktok_user_999',
        account_name: 'OceanGate TikTok',
        access_token: 'mock_tiktok_access_token_encrypted'
      };

      const existing = await Connection.findOne({ where: { platform: 'tiktok' } });
      let connection;
      if (existing) {
        connection = await existing.update({ status: 'active', credentials });
      } else {
        connection = await Connection.create({ platform: 'tiktok', status: 'active', credentials });
      }

      res.json({ success: true, message: 'TikTok connected successfully', connection });
    } catch (error) { next(error); }
  }

  async getAccounts(req, res, next) {
    try {
      res.json({ success: true, data: [{ id: 'tiktok_user_999', name: '@oceangatetravel' }] });
    } catch (error) { next(error); }
  }

  async createCampaign(req, res, next) {
    try {
      res.json({ success: true, message: 'TikTok campaign created in draft mode', external_id: 'tiktok_camp_001' });
    } catch (error) { next(error); }
  }

  async publishContent(req, res, next) {
    try {
      res.json({ success: true, message: 'Content queued for TikTok Direct Post' });
    } catch (error) { next(error); }
  }

  async getReporting(req, res, next) {
    try {
      res.json({ success: true, data: { spend: 400.00, views: 85000, clicks: 3200, conversions: 50 } });
    } catch (error) { next(error); }
  }
}

module.exports = new TiktokController();
