const { ContentPost, Campaign } = require('../../db/postgresModels');
const { Op } = require('sequelize');

class PostgresContentPostRepository {
  async findAll(options = {}) {
    const where = {};
    if (options.startDate && options.endDate) {
      where.scheduled_date = {
        [Op.between]: [new Date(options.startDate), new Date(options.endDate)]
      };
    }
    if (options.platform && options.platform !== 'All') {
      where.platform = { [Op.iLike]: `%${options.platform}%` };
    }
    if (options.status && options.status !== 'All') {
      where.status = options.status;
    }

    return await ContentPost.findAll({
      where,
      order: [['scheduled_date', 'ASC']],
      include: [{ model: Campaign, attributes: ['id', 'name', 'platform'], required: false }]
    });
  }

  async findById(id) {
    return await ContentPost.findByPk(id, {
      include: [{ model: Campaign, attributes: ['id', 'name', 'platform'], required: false }]
    });
  }

  async create(data) {
    return await ContentPost.create({
      title: data.title || 'Untitled Post',
      content: data.content || '',
      platform: data.platform || 'Meta',
      scheduled_date: data.scheduled_date || data.scheduledDate || new Date(),
      status: data.status || 'Scheduled',
      media_url: data.media_url || data.mediaUrl || data.image_url || '',
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
      author: data.author || 'Marketing Team',
      engagement: data.engagement || { likes: 0, comments: 0, shares: 0, reach: 0 },
      campaign_id: data.campaign_id || data.campaignId || null
    });
  }

  async update(id, data) {
    const post = await ContentPost.findByPk(id);
    if (!post) return null;
    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.platform !== undefined) payload.platform = data.platform;
    if (data.scheduled_date !== undefined || data.scheduledDate !== undefined) {
      payload.scheduled_date = data.scheduled_date || data.scheduledDate;
    }
    if (data.status !== undefined) payload.status = data.status;
    if (data.media_url !== undefined || data.mediaUrl !== undefined || data.image_url !== undefined) {
      payload.media_url = data.media_url || data.mediaUrl || data.image_url;
    }
    if (data.hashtags !== undefined) payload.hashtags = Array.isArray(data.hashtags) ? data.hashtags : [];
    if (data.engagement !== undefined) payload.engagement = data.engagement;
    if (data.campaign_id !== undefined || data.campaignId !== undefined) {
      payload.campaign_id = data.campaign_id || data.campaignId;
    }

    return await post.update(payload);
  }

  async delete(id) {
    const post = await ContentPost.findByPk(id);
    if (!post) return null;
    await post.destroy();
    return true;
  }
}

module.exports = PostgresContentPostRepository;
