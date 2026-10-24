const PostgresContentPostRepository = require('./contentPost.postgres.repository');
const aiService = require('../ai/ai.service');
const { Asset } = require('../../db/postgresModels');

class ContentPostController {
  constructor() {
    this.repo = new PostgresContentPostRepository();
  }

  getPosts = async (req, res, next) => {
    try {
      const { month, year, platform, status, startDate, endDate } = req.query;
      let posts = await this.repo.findAll({ platform, status, startDate, endDate });

      // If no posts exist yet in the database, seed sample posts for the current/selected month
      if (posts.length === 0 && (!platform || platform === 'All') && (!status || status === 'All')) {
        const now = new Date();
        const curYear = year ? parseInt(year) : now.getFullYear();
        const curMonth = month !== undefined ? parseInt(month) : now.getMonth();

        const samplePosts = [
          {
            title: 'Sunset Yacht Charter Special',
            content: 'Sail past the Dubai Marina skyline into the golden sunset. Enjoy private catering, live music, and luxury yacht amenities. Book your weekend voyage now! 🛥️🌅',
            platform: 'Instagram',
            scheduled_date: new Date(curYear, curMonth, 5, 17, 30),
            status: 'Published',
            media_url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1000&auto=format&fit=crop&q=80',
            hashtags: ['#DubaiYacht', '#LuxuryTravel', '#OceanGateDubai', '#MarinaLife'],
            author: 'Sarah Jenkins',
            engagement: { likes: 342, comments: 28, shares: 19, reach: 4200 }
          },
          {
            title: 'VIP Desert Dune Safari Reel',
            content: 'High-adrenaline dune bashing across the red Arabian sands followed by a 5-star desert camp dinner under the stars. 🏜️✨ Exclusive 20% discount for families this season.',
            platform: 'TikTok',
            scheduled_date: new Date(curYear, curMonth, 12, 14, 0),
            status: 'Published',
            media_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1000&auto=format&fit=crop&q=80',
            hashtags: ['#DesertSafari', '#DubaiAdventure', '#TravelDubai', '#OceanGate'],
            author: 'Tariq Al-Mansoor',
            engagement: { likes: 1250, comments: 84, shares: 140, reach: 18900 }
          },
          {
            title: 'Helicopter City Tour Promo',
            content: 'See the Burj Khalifa and Palm Jumeirah from the sky. Certified pilots, ultra-luxury Eurocopter fleet. Limited departure slots available daily. 🚁🏙️',
            platform: 'Meta',
            scheduled_date: new Date(curYear, curMonth, 18, 10, 15),
            status: 'Scheduled',
            media_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1000&auto=format&fit=crop&q=80',
            hashtags: ['#DubaiHelicopter', '#BurjKhalifa', '#SkylineViews', '#LuxuryTours'],
            author: 'Sarah Jenkins',
            engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
          },
          {
            title: 'Exclusive Airport Chauffeur Service',
            content: 'Arrive in style with our fleet of Mercedes S-Class and Rolls Royce airport transfers. Seamless meet & greet, flight tracking, and zero wait time. 🚘✈️',
            platform: 'Google',
            scheduled_date: new Date(curYear, curMonth, 22, 9, 0),
            status: 'Scheduled',
            media_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&auto=format&fit=crop&q=80',
            hashtags: ['#VIPTransfer', '#DubaiAirport', '#ChauffeurDubai', '#BusinessTravel'],
            author: 'Alex Rivera',
            engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
          },
          {
            title: 'Luxury Villa & Staycation Showcase',
            content: 'Unwind at Dubai’s most secluded waterfront private villas. Infinity pools, private chefs, and bespoke concierge services at your fingertips. 🏖️🥂',
            platform: 'LinkedIn',
            scheduled_date: new Date(curYear, curMonth, 27, 16, 45),
            status: 'Draft',
            media_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80',
            hashtags: ['#LuxuryHospitality', '#DubaiStaycation', '#OceanGateConcierge'],
            author: 'Sarah Jenkins',
            engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
          }
        ];

        for (const post of samplePosts) {
          await this.repo.create(post);
        }

        posts = await this.repo.findAll({ platform, status, startDate, endDate });
      }

      // Compute statistics
      const totalPosts = posts.length;
      const scheduledCount = posts.filter(p => p.status === 'Scheduled').length;
      const publishedCount = posts.filter(p => p.status === 'Published').length;
      const draftCount = posts.filter(p => p.status === 'Draft').length;
      const totalEngagement = posts.reduce((sum, p) => sum + ((p.engagement?.likes || 0) + (p.engagement?.shares || 0) + (p.engagement?.comments || 0)), 0);
      const totalReach = posts.reduce((sum, p) => sum + (p.engagement?.reach || 0), 0);

      res.json({
        success: true,
        data: {
          posts,
          stats: {
            total: totalPosts,
            scheduled: scheduledCount,
            published: publishedCount,
            drafts: draftCount,
            engagement: totalEngagement,
            estimated_reach: totalReach || 23100
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  createPost = async (req, res, next) => {
    try {
      const { title, content, platform, scheduled_date, status, media_url, hashtags, author } = req.body;
      if (!title || !scheduled_date) {
        return res.status(400).json({ success: false, message: 'Title and scheduled date are required.' });
      }

      const post = await this.repo.create({
        title,
        content,
        platform: platform || 'Meta',
        scheduled_date: new Date(scheduled_date),
        status: status || 'Scheduled',
        media_url,
        hashtags: Array.isArray(hashtags) ? hashtags : (typeof hashtags === 'string' ? hashtags.split(/[\s,]+/).filter(Boolean) : []),
        author: author || 'Marketing Team'
      });

      // Save media to Asset Library if image is present
      if (media_url) {
        try {
          await Asset.create({
            url: media_url,
            type: 'image',
            name: title,
            category: 'Content Calendar',
            source: 'Calendar',
            tags: ['social', (platform || 'meta').toLowerCase(), 'post_' + post.id],
            owner: 'System'
          });
        } catch (assetErr) {
          console.warn('[Calendar Asset Save Notice]', assetErr.message);
        }
      }

      res.status(201).json({ success: true, data: post, message: 'Post scheduled successfully!' });
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req, res, next) => {
    try {
      const updated = await this.repo.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Post not found.' });
      }
      res.json({ success: true, data: updated, message: 'Post updated successfully!' });
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (req, res, next) => {
    try {
      const deleted = await this.repo.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Post not found.' });
      }
      res.json({ success: true, message: 'Post deleted successfully!' });
    } catch (error) {
      next(error);
    }
  };

  publishPost = async (req, res, next) => {
    try {
      const post = await this.repo.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found.' });
      }

      // Simulate live publishing
      const simulatedEngagement = {
        likes: Math.floor(Math.random() * 400) + 50,
        comments: Math.floor(Math.random() * 40) + 5,
        shares: Math.floor(Math.random() * 30) + 2,
        reach: Math.floor(Math.random() * 5000) + 1200
      };

      const updated = await post.update({
        status: 'Published',
        engagement: simulatedEngagement
      });

      res.json({
        success: true,
        data: updated,
        message: `Post successfully published to ${post.platform}!`
      });
    } catch (error) {
      next(error);
    }
  };

  generateAiContent = async (req, res, next) => {
    try {
      const { topic, platform, tone } = req.body;
      if (!topic) {
        return res.status(400).json({ success: false, message: 'Topic/Prompt is required.' });
      }

      const generated = await aiService.generateMarketingCopy({
        objective: topic,
        targetAudience: 'Tourists and residents in UAE seeking luxury experiences',
        platform: platform || 'Instagram',
        tone: tone || 'Luxury & Engaging'
      });

      res.json({
        success: true,
        data: {
          title: generated.headline,
          content: generated.variants && generated.variants.length > 0 ? generated.variants[0] : generated.headline,
          variants: generated.variants || [],
          hashtags: generated.hashtags || ['#OceanGate', '#Dubai', '#LuxuryTravel'],
          media_url: generated.image_url || `https://image.pollinations.ai/prompt/${encodeURIComponent(topic + ' luxury dubai cinematic 4k')}?width=1024&height=1024&nologo=true`
        }
      });
    } catch (error) {
      console.warn('[AI Content Post Fallback]', error.message);
      const fallbackTopic = req.body.topic || 'Dubai Luxury Experience';
      res.json({
        success: true,
        data: {
          title: `${fallbackTopic} | OceanGate Experience`,
          content: `Experience the epitome of Arabian elegance with OceanGate. Book your bespoke ${fallbackTopic.toLowerCase()} and indulge in unparalleled comfort, breathtaking views, and 5-star service. ✨🛥️`,
          variants: [
            `Discover extraordinary moments in Dubai with our premier ${fallbackTopic.toLowerCase()}. Reserve your experience today.`,
            `Elevate your stay with OceanGate’s signature ${fallbackTopic.toLowerCase()}. Tailored perfection await you.`
          ],
          hashtags: ['#OceanGateDubai', '#LuxuryExperience', '#VisitDubai', '#TravelUAE'],
          media_url: `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackTopic + ' dubai luxury 4k cinematic')}?width=1024&height=1024&nologo=true`
        }
      });
    }
  };
}

module.exports = new ContentPostController();
