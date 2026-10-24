const Campaign = require('./campaign.model');

class MongoCampaignRepository {
  async create(campaignData) {
    const campaign = new Campaign(campaignData);
    return await campaign.save();
  }

  async findAll() {
    return await Campaign.find();
  }

  async findById(id) {
    return await Campaign.findById(id);
  }

  async update(id, campaignData) {
    return await Campaign.findByIdAndUpdate(id, campaignData, { new: true });
  }

  async delete(id) {
    return await Campaign.findByIdAndDelete(id);
  }
}

module.exports = MongoCampaignRepository;
