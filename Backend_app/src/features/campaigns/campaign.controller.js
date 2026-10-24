const DatabaseFactory = require('../../db/dbFactory');

class CampaignController {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) this._repo = DatabaseFactory.getRepository('campaigns');
    return this._repo;
  }

  createCampaign = async (req, res, next) => {
    try {
      const campaign = await this.repo.create(req.body);
      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  };

  getCampaigns = async (req, res, next) => {
    try {
      const campaigns = await this.repo.findAll();
      res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  };

  deleteCampaign = async (req, res, next) => {
    try {
      const success = await this.repo.delete(req.params.id);
      if (!success) return res.status(404).json({ success: false, message: 'Campaign not found' });
      res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CampaignController();
