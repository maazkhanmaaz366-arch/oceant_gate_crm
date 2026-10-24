const DatabaseFactory = require('../../db/dbFactory');
const { Customer } = require('../../db/postgresModels');

class LeadService {
  constructor() {
    this._repo = null;
  }
  
  get repo() {
    if (!this._repo) this._repo = DatabaseFactory.getRepository('leads');
    return this._repo;
  }

  async getAllLeads() { return await this.repo.findAll(); }

  async createLead(data) { 
    const lead = await this.repo.create(data); 
    const leadId = lead.id;
    
    // AUTOMATION: Run AI Analysis in background (non-blocking)
    setTimeout(async () => {
      try {
        const aiService = require('../ai/ai.service');
        const analysis = await aiService.analyzeLead(lead);
        if (analysis) {
          await this.repo.update(leadId, {
            ai_summary: analysis.summary,
            ai_action: analysis.action,
            ai_service_interest: analysis.service_interest,
            ai_urgency: analysis.urgency,
            ai_budget_classification: analysis.budget_classification,
          });
          console.log(`[AI] Lead ${leadId} analyzed: ${analysis.action}`);
        }
      } catch (err) {
        console.error("Background AI lead analysis failed:", err);
      }
    }, 0);

    return lead;
  }

  async updateLeadStatus(leadId, status) {
    return await this.repo.update(leadId, { status });
  }

  async convertLead(leadId, data = {}, user) {
    const lead = await this.repo.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    const customerRepo = DatabaseFactory.getRepository('customers');
    const bookingRepo = DatabaseFactory.getRepository('bookings');
    const { Customer, Booking } = require('../../db/postgresModels');

    let customer = null;
    const existingCustomerId = lead.customer_id || lead.CustomerId;

    if (existingCustomerId) {
      customer = await customerRepo.findById(existingCustomerId);
    }

    if (!customer) {
      const customerData = data.customer || {};
      let fullName = (customerData.name || data.customer_name || lead.source_details?.name || '').trim();
      let firstName = customerData.first_name || '';
      let lastName = customerData.last_name || '';

      if (!firstName) {
        if (fullName) {
          const parts = fullName.split(' ');
          firstName = parts[0] || 'Guest';
          lastName = parts.slice(1).join(' ') || 'Client';
        } else {
          firstName = 'Valued';
          lastName = 'Guest';
        }
      }

      const phone = customerData.phone || data.phone || lead.source_details?.phone || '00000000';
      const email = customerData.email || data.email || lead.source_details?.email || null;

      // Try to find existing customer by phone or email if available
      if (phone && phone !== '00000000') {
        customer = await Customer.findOne({ where: { phone } });
      }
      if (!customer && email) {
        customer = await Customer.findOne({ where: { email } });
      }

      // If still not found, create new Customer
      if (!customer) {
        customer = await Customer.create({
          first_name: firstName,
          last_name: lastName || 'Client',
          phone: phone,
          email: email,
          type: 'B2C'
        });
      }

      // Link customer to lead and set status to confirmed
      await this.repo.update(leadId, {
        customer_id: customer.id,
        status: 'confirmed'
      });
    } else {
      // Ensure lead status is confirmed
      await this.repo.update(leadId, {
        status: 'confirmed'
      });
    }

    // 3. Create Draft Booking if not already created
    let booking = await Booking.findOne({ where: { lead_id: leadId } });
    const bookingData = data.booking || data || {};

    if (!booking) {
      booking = await bookingRepo.create({
        customer_id: customer.id,
        lead_id: leadId,
        service_type: bookingData.service_type || lead.service_interest || 'General Travel',
        pickup_location: bookingData.pickup_location || 'Dubai Marina',
        dropoff_location: bookingData.dropoff_location || 'Burj Khalifa',
        customer_price: Number(bookingData.customer_price) || lead.budget_expectation || 1500,
        status: 'confirmed',
        payment_status: 'unpaid'
      });
    }

    return {
      message: 'Lead converted successfully',
      lead,
      customer,
      booking
    };
  }

  async deleteLead(id) {
    return await this.repo.delete(id);
  }
}

module.exports = new LeadService();
