const DatabaseFactory = require('../../db/dbFactory');
const aiService = require('../ai/ai.service');

class AssetController {
  constructor() {
    this._repo = null;
  }

  get repo() {
    if (!this._repo) this._repo = DatabaseFactory.getRepository('assets');
    return this._repo;
  }

  createAsset = async (req, res, next) => {
    try {
      const asset = await this.repo.create(req.body);
      const data = asset.toJSON ? asset.toJSON() : asset;
      data.fileUrl = data.url;
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getAssets = async (req, res, next) => {
    try {
      let assets = await this.repo.findAll();
      
      // Auto-seed demo luxury assets if library is empty
      if (assets.length === 0) {
        const seedAssets = [
          {
            name: 'Burj Al Arab Sunset View',
            url: 'https://images.unsplash.com/photo-1546412414-e1885259563a?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'Hotels',
            source: 'Manual',
            tags: ['dubai', 'burj_al_arab', 'luxury', '5_star'],
            dimensions: '1920x1080'
          },
          {
            name: 'Arabian Red Dunes Safari',
            url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'Tours',
            source: 'Manual',
            tags: ['desert', 'safari', 'dunes', 'adventure'],
            dimensions: '1920x1080'
          },
          {
            name: 'Mega Yacht Dubai Marina',
            url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'Yacht Rentals',
            source: 'Manual',
            tags: ['yacht', 'marina', 'cruise', 'vip'],
            dimensions: '1920x1080'
          },
          {
            name: 'VIP Rolls Royce Chauffeur',
            url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'Chauffeur',
            source: 'Manual',
            tags: ['airport_pickup', 'rolls_royce', 'vip', 'transfer'],
            dimensions: '1920x1080'
          },
          {
            name: 'Palm Jumeirah Helicopter Flight',
            url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'Tours',
            source: 'Manual',
            tags: ['helicopter', 'skyline', 'palm_jumeirah', 'aerial'],
            dimensions: '1920x1080'
          },
          {
            name: 'Futuristic Marina Skyline AI',
            url: 'https://images.unsplash.com/photo-1512453979434-d8ce60c430bc?w=1000&auto=format&fit=crop&q=80',
            type: 'image',
            category: 'AI Generated',
            source: 'AI',
            tags: ['ai_render', 'concept', 'futuristic', 'dubai_skyline'],
            dimensions: '1024x1024'
          }
        ];

        for (const asset of seedAssets) {
          await this.repo.create(asset);
        }

        assets = await this.repo.findAll();
      }

      const formatted = assets.map(a => {
        const item = a.toJSON ? a.toJSON() : a;
        item.fileUrl = item.url;
        return item;
      });

      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  };

  deleteAsset = async (req, res, next) => {
    try {
      const success = await this.repo.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Asset not found.' });
      }
      res.json({ success: true, message: 'Asset deleted successfully.' });
    } catch (error) {
      next(error);
    }
  };

  generateAiAsset = async (req, res, next) => {
    try {
      const { prompt, category, name } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required.' });
      }

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' luxury dubai cinematic 4k highly detailed')}?width=1024&height=1024&nologo=true`;
      
      const asset = await this.repo.create({
        name: name || prompt,
        url: imageUrl,
        type: 'image',
        category: category || 'AI Generated',
        source: 'AI',
        tags: ['ai_generated', '4k', (category || 'luxury').toLowerCase().replace(/\s+/g, '_')],
        dimensions: '1024x1024',
        owner: 'OceanGate AI'
      });

      const data = asset.toJSON ? asset.toJSON() : asset;
      data.fileUrl = data.url;

      res.status(201).json({ success: true, data, message: 'AI asset generated and saved to library!' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AssetController();
