const Lead = require('../leads/lead.model');

class WebhookController {
  async websiteLead(req, res, next) {
    try {
      // Basic validation
      const { name, email, phone, service_interest, utm_source } = req.body;
      
      if (!name || (!email && !phone)) {
        return res.status(400).json({ success: false, message: 'Name and either email or phone is required' });
      }

      // Safely create the lead
      const lead = await Lead.create({
        source: 'Website',
        source_details: {
          name,
          email,
          phone,
          utm_source: utm_source || 'direct'
        },
        service_interest: service_interest || 'General Inquiry',
        status: 'new'
      });

      console.log(`[Webhook] New website lead created: ${lead._id}`);

      // We respond 200 immediately to the external webhook
      res.json({ success: true, message: 'Lead received successfully' });
    } catch (error) {
      console.error('[Webhook Error]', error);
      // Return 200 even on error to prevent external retries spamming, but log it
      res.json({ success: false, message: 'Lead processing failed' });
    }
  }

  async websiteHealth(req, res, next) {
    res.json({ success: true, status: 'alive' });
  }
}

module.exports = new WebhookController();
