class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.isConfigured = !!this.apiKey;
  }

  /**
   * MOCK IMPLEMENTATION: Send Booking Confirmation (Blueprint Page 17 & 14)
   */
  async sendBookingConfirmation(customerPhone, bookingDetails) {
    if (!this.isConfigured) {
      console.log(`[MOCK WHATSAPP] Would send booking confirmation to ${customerPhone}`);
      return { success: true, messageId: 'mock-msg-id-123' };
    }
    
    // Real implementation would go here using Axios to hit the WhatsApp Graph API
    throw new Error("Live WhatsApp integration not yet fully implemented.");
  }

  /**
   * MOCK IMPLEMENTATION: Send Job Card to Driver
   */
  async sendDriverJobCard(driverPhone, jobDetails) {
    if (!this.isConfigured) {
      console.log(`[MOCK WHATSAPP] Would send job card to driver ${driverPhone}`);
      return { success: true, messageId: 'mock-msg-id-456' };
    }
    
    // Real implementation would go here
    throw new Error("Live WhatsApp integration not yet fully implemented.");
  }
}

module.exports = new WhatsAppService();
