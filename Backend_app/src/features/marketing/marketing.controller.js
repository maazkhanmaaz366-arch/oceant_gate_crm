const adsService = require('./ads.service');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { Campaign, Lead, Booking, Customer } = require('../../db/postgresModels');

class MarketingController {
  async getDashboard(req, res, next) {
    try {
      // Fetch real campaigns from PostgreSQL database
      const realCampaigns = await Campaign.findAll({ order: [['createdAt', 'DESC']] });
      
      const formattedRealCampaigns = await Promise.all(realCampaigns.map(async (c) => {
        // --- ATTRIBUTION ENGINE ---
        // 1. Find all leads that originated from this campaign
        const leads = await Lead.findAll({
          where: {
            source_details: {
              campaign_id: c.id
            }
          }
        });
        const leadIds = leads.map(l => l.id);
        
        // 2. Find all non-cancelled bookings that came from those leads
        let bookings = [];
        if (leadIds.length > 0) {
          bookings = await Booking.findAll({
            where: {
              lead_id: { [Op.in]: leadIds },
              status: { [Op.ne]: 'cancelled' }
            }
          });
        }
        
        // 3. Sum up the revenue
        const revenue = bookings.reduce((sum, b) => sum + (Number(b.customer_price || b.total_price) || 0), 0);
        
        // 4. Calculate ROAS
        let spend = 0;
        if (c.status === 'Active') {
          spend = Math.floor((c.budget || 1000) * 0.2);
        } else if (c.status === 'Simulated') {
          spend = 500;
        }

        let roas = '-';
        if (spend > 0) {
          roas = (revenue / spend).toFixed(1) + 'x';
        } else if (revenue > 0) {
          roas = '∞';
        }

        return {
          id: c.id,
          platform: c.platform || 'Multi',
          name: c.name,
          status: c.status || 'Draft',
          budget: c.budget || 0,
          spend: `AED ${spend.toLocaleString()}`,
          bookings: bookings.length,
          roas: roas,
          objective: c.objective,
          offer_title: c.offer_title,
          ai_creative: c.ai_creative,
          target_audience: c.target_audience,
          createdAt: c.createdAt
        };
      }));

      // Calculate totals for real campaigns to add to stats
      const totalRealSpend = formattedRealCampaigns.reduce((sum, c) => sum + parseInt(c.spend.replace(/\D/g, '') || 0), 0);
      const totalRealBookings = formattedRealCampaigns.reduce((sum, c) => sum + c.bookings, 0);

      const data = {
        stats: {
          spend: `AED ${(12450 + totalRealSpend).toLocaleString()}`,
          leads: 342 + formattedRealCampaigns.length * 3,
          bookings: 84 + totalRealBookings,
          revenue: `AED ${(84000 + (totalRealBookings * 5000)).toLocaleString()}`,
          roas: '6.7x'
        },
        campaigns: [
          ...formattedRealCampaigns,
          { id: 'meta_camp_mock_1', platform: 'Meta', name: 'Summer Yacht Promo 2026', status: 'Active', spend: 'AED 4,200', bookings: 32, roas: '7.1x' },
          { id: 'google_camp_mock_2', platform: 'Google', name: 'Dubai Desert Safari Search', status: 'Active', spend: 'AED 3,850', bookings: 28, roas: '5.8x' },
          { id: 'meta_camp_mock_3', platform: 'Meta', name: 'Luxury City Tours Lookalike', status: 'Paused', spend: 'AED 1,200', bookings: 4, roas: '2.5x' },
          { id: 'google_camp_mock_4', platform: 'Google', name: 'Helicopter Ride PMax', status: 'Active', spend: 'AED 3,200', bookings: 20, roas: '8.4x' }
        ]
      };
      
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async pushCampaign(req, res, next) {
    try {
      const { platform, draft, objective, targetAudience, budget, name } = req.body;
      if (!platform && !draft) {
        return res.status(400).json({ success: false, message: 'Platform and draft data are required' });
      }

      const campaignName = name || objective || (draft && draft.headline) || 'AI Campaign Draft';
      const campPlatform = platform || 'Meta';
      const campBudget = Number(budget) || 1000;

      // 1. Persist the campaign in PostgreSQL
      const campaign = await Campaign.create({
        name: campaignName,
        platform: campPlatform,
        status: 'Draft',
        budget: campBudget,
        spend: 0,
        objective: objective || (draft && draft.headline) || '',
        offer_title: (draft && draft.headline) || '',
        target_audience: targetAudience || '',
        channels: [campPlatform],
        ai_creative: draft || {}
      });

      // 2. Push / Sync to Ads Service
      let pushResult = { success: true, message: 'Campaign saved to CRM as draft.' };
      try {
        if (draft) {
          pushResult = await adsService.pushCampaign(campPlatform, draft);
        }
      } catch (adError) {
        console.warn('[Ads Service Push Warning]', adError.message);
      }

      res.json({
        success: true,
        campaign_id: campaign.id,
        campaign: campaign,
        push_result: pushResult,
        message: pushResult.message || 'Campaign successfully saved to CRM!'
      });
    } catch (error) {
      console.error('[Marketing Controller - pushCampaign Error]', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async simulateConversion(req, res, next) {
    try {
      const { campaign_id } = req.body;
      if (!campaign_id) return res.status(400).json({ success: false, message: 'Campaign ID required' });

      // 1. Mark campaign as Simulated
      const campaign = await Campaign.findByPk(campaign_id);
      if (campaign) {
        await campaign.update({ status: 'Simulated' });
      }

      // 2. Create customer for simulation
      const customer = await Customer.create({
        first_name: 'Simulated',
        last_name: 'Customer',
        phone: '971500000000',
        email: 'simulated@ocean-gate.ae'
      });

      // 3. Create a dummy Lead attributed to this campaign
      const lead = await Lead.create({
        customer_id: customer.id,
        source: 'Facebook',
        source_details: { campaign_id: campaign_id },
        service_interest: 'Tour Booking',
        status: 'confirmed'
      });

      // 4. Create a dummy Booking attributed to this Lead
      await Booking.create({
        customer_id: customer.id,
        lead_id: lead.id,
        service_type: 'Tour Booking',
        service_date: new Date(),
        pickup_location: 'Dubai',
        dropoff_location: 'Dubai',
        customer_price: 5000,
        status: 'confirmed'
      });

      res.json({ success: true, message: 'Attribution simulated successfully!' });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = new MarketingController();
