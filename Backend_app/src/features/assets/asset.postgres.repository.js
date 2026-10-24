const { Asset } = require('../../db/postgresModels');

class PostgresAssetRepository {
  async findAll() {
    return await Asset.findAll({ order: [['createdAt', 'DESC']] });
  }

  async findById(id) {
    return await Asset.findByPk(id);
  }

  async create(data) {
    const payload = {
      url: data.url || data.fileUrl || '',
      type: data.type || 'image',
      name: data.name || (data.tags && data.tags[0]) || 'AI Generated Asset',
      category: data.category || 'AI Generated',
      source: data.source || 'AI',
      tags: Array.isArray(data.tags) ? data.tags : [],
      dimensions: data.dimensions || '1024x1024',
      owner: data.owner || 'System'
    };
    return await Asset.create(payload);
  }

  async update(id, data) {
    const asset = await Asset.findByPk(id);
    if (!asset) return null;
    return await asset.update(data);
  }

  async delete(id) {
    const asset = await Asset.findByPk(id);
    if (!asset) return null;
    await asset.destroy();
    return true;
  }
}

module.exports = PostgresAssetRepository;
