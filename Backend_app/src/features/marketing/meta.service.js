class MetaAdsService {
  /**
   * MOCK IMPLEMENTATION: Sync Campaigns (Blueprint Page 18 & 36)
   */
  async getCampaigns() {
    // Simulated fetch from Facebook Graph API
    return [
      { id: 'meta-1', platform: 'Meta', name: 'Airport Transfer', status: 'Active', spend: 120, leads: 45, bookings: 18, roas: 4.2 },
      { id: 'meta-2', platform: 'Meta', name: 'Desert Safari', status: 'Draft', spend: 0, leads: 0, bookings: 0, roas: 0 },
    ];
  }

  /**
   * MOCK IMPLEMENTATION: Receive Lead Webhook
   */
  async receiveLeadWebhook(payload) {
    console.log(`[MOCK META] Received lead webhook payload`, payload);
    return { success: true, leadId: 'mock-lead-789' };
  }
}

module.exports = new MetaAdsService();
