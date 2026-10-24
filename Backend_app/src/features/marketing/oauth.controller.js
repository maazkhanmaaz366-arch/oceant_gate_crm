const axios = require('axios');
const { Integration } = require('../../db/postgresModels');

class OAuthController {
  // META OAUTH
  async metaLogin(req, res, next) {
    try {
      const appId = process.env.META_APP_ID;
      const redirectUri = `http://localhost:${process.env.PORT || 5000}/api/oauth/meta/callback`;
      const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=ads_management,ads_read`;
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  async metaCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).send('No code provided');

      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const redirectUri = `http://localhost:${process.env.PORT || 5000}/api/oauth/meta/callback`;

      // Exchange code for access token
      const tokenResponse = await axios.get(`https://graph.facebook.com/v17.0/oauth/access_token`, {
        params: {
          client_id: appId,
          redirect_uri: redirectUri,
          client_secret: appSecret,
          code: code
        }
      });

      const { access_token, expires_in } = tokenResponse.data;

      const expiresAt = new Date();
      if (expires_in) expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Save to database
      const existing = await Integration.findOne({ where: { name: 'meta' } });
      if (existing) {
        await existing.update({
          api_key: access_token,
          is_active: true
        });
      } else {
        await Integration.create({
          name: 'meta',
          api_key: access_token,
          is_active: true
        });
      }

      // Redirect back to frontend
      const targetUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/marketing?connected=meta` : '/marketing?connected=meta';
      res.redirect(targetUrl);
    } catch (error) {
      console.error('Meta OAuth Error:', error.response?.data || error.message);
      const errorUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/marketing?error=meta_auth_failed` : '/marketing?error=meta_auth_failed';
      res.redirect(errorUrl);
    }
  }

  // GOOGLE OAUTH
  async googleLogin(req, res, next) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `http://localhost:${process.env.PORT || 5000}/api/oauth/google/callback`;
      const scope = 'https://www.googleapis.com/auth/adwords';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).send('No code provided');

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `http://localhost:${process.env.PORT || 5000}/api/oauth/google/callback`;

      // Exchange code for access token
      const tokenResponse = await axios.post(`https://oauth2.googleapis.com/token`, {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const { access_token } = tokenResponse.data;

      // Save to database
      const existing = await Integration.findOne({ where: { name: 'google' } });
      if (existing) {
        await existing.update({
          api_key: access_token,
          is_active: true
        });
      } else {
        await Integration.create({
          name: 'google',
          api_key: access_token,
          is_active: true
        });
      }

      const targetUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/marketing?connected=google` : '/marketing?connected=google';
      res.redirect(targetUrl);
    } catch (error) {
      console.error('Google OAuth Error:', error.response?.data || error.message);
      const errorUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/marketing?error=google_auth_failed` : '/marketing?error=google_auth_failed';
      res.redirect(errorUrl);
    }
  }
}

module.exports = new OAuthController();
