class GoogleAdsService {
  /**
   * MOCK IMPLEMENTATION: Sync Campaigns (Blueprint Page 36 & 38)
   */
  async getCampaigns() {
    // Simulated fetch from Google Ads API
    return [
      { id: 'google-1', platform: 'Google', name: 'Dubai Airport', status: 'Active', spend: 90, leads: 30, bookings: 9, roas: 3.8 },
      { id: 'google-2', platform: 'Google', name: 'Abu Dhabi Tour', status: 'Paused', spend: 70, leads: 22, bookings: 4, roas: 1.5 },
    ];
  }
}

module.exports = new GoogleAdsService();
