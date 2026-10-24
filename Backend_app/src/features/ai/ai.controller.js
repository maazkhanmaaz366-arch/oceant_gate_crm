const aiService = require('./ai.service');

class AiController {
  async generateCopy(req, res, next) {
    try {
      const data = await aiService.generateMarketingCopy(req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async generateLeadProposal(req, res, next) {
    try {
      const data = await aiService.generateLeadProposal(req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async translateText(req, res, next) {
    try {
      const data = await aiService.translateText(req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AiController();
