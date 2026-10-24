const { Campaign } = require('../../db/postgresModels');

class PostgresCampaignRepository {
  async findAll() {
    return await Campaign.findAll({ order: [['createdAt', 'DESC']] });
  }

  async findById(id) {
    return await Campaign.findByPk(id);
  }

  _normalizeData(data) {
    if (!data) return {};
    const platform = data.platform || (Array.isArray(data.channels) && data.channels.length > 0 ? data.channels.join(', ') : data.channels) || 'Meta';
    const budget = Number(data.budget !== undefined ? data.budget : (data.totalBudget !== undefined ? data.totalBudget : 0)) || 0;
    const name = data.name || data.offerTitle || data.objective || (data.aiCreative && data.aiCreative.headline) || (data.draft && data.draft.headline) || 'Untitled Campaign';
    const ai_creative = data.ai_creative || data.aiCreative || data.draft || {};
    
    return {
      name,
      platform,
      status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : 'Draft',
      budget,
      spend: Number(data.spend) || 0,
      objective: data.objective || '',
      offer_title: data.offer_title || data.offerTitle || '',
      target_audience: data.target_audience || data.targetAudience || data.targetOrigin || '',
      target_origin: data.target_origin || data.targetOrigin || '',
      target_destination: data.target_destination || data.targetDestination || 'Dubai, UAE',
      travel_start_date: data.travel_start_date || data.travelStartDate || null,
      travel_end_date: data.travel_end_date || data.travelEndDate || null,
      channels: Array.isArray(data.channels) ? data.channels : (data.platform ? [data.platform] : ['Meta']),
      ai_creative
    };
  }

  async create(data) {
    const normalized = this._normalizeData(data);
    return await Campaign.create(normalized);
  }

  async update(id, data) {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) return null;
    const normalized = this._normalizeData({ ...campaign.toJSON(), ...data });
    return await campaign.update(normalized);
  }

  async delete(id) {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) return null;
    await campaign.destroy();
    return true;
  }
}

module.exports = PostgresCampaignRepository;
