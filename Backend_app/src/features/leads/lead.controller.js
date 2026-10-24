const leadService = require('./lead.service');

class LeadController {
  async getLeads(req, res, next) {
    try {
      const data = await leadService.getAllLeads();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createLead(req, res, next) {
    try {
      const data = await leadService.createLead(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async convertLead(req, res, next) {
    try {
      const data = await leadService.convertLead(req.params.id, req.body, req.user);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
  async updateStatus(req, res, next) {
    try {
      const leadId = req.params.id;
      const lead = await leadService.repo.findById(leadId);
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
      
      const newStatus = req.body.status;
      const history = lead.status_history || [];
      
      const updateData = { ...req.body };
      
      if (newStatus && newStatus !== lead.status) {
        const historyEntry = {
          status: newStatus,
          changed_at: new Date()
        };
        if (req.user && (req.user.id || req.user._id)) {
          historyEntry.changed_by = req.user.id || req.user._id;
        }
        updateData.status = newStatus;
        updateData.status_history = [...history, historyEntry];
      }
      
      const updated = await leadService.repo.update(leadId, updateData);

      // AUTOMATION: If confirmed, auto-convert it
      if (newStatus === 'confirmed' && !lead.customer_id && !lead.CustomerId) {
        try {
          const nameParts = ((updated && updated.source_details?.name) || 'New Customer').split(' ');
          const id = (updated && (updated.id || updated._id)) || leadId;
          await leadService.convertLead(id, {
            customer: {
              first_name: nameParts[0] || 'New',
              last_name: nameParts.slice(1).join(' ') || 'Customer',
              email: updated?.source_details?.email,
              phone: updated?.source_details?.phone || '00000000'
            },
            booking: {
              service_type: updated?.service_interest || 'General Travel',
              customer_price: updated?.budget_expectation || 0
            }
          }, req.user);
        } catch (convErr) {
          console.error("Auto-conversion failed:", convErr);
        }
      }

      res.json({ success: true, data: updated || lead });
    } catch (error) { next(error); }
  }

  async deleteLead(req, res, next) {
    try {
      const success = await leadService.deleteLead(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Lead not found' });
      res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) { next(error); }
  }
}

module.exports = new LeadController();
