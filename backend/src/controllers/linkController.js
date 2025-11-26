const { nanoid } = require('nanoid');
const LinkModel = require('../models/linkModel');

class LinkController {
  // Create short link
  static async createLink(req, res, next) {
    try {
      const { originalUrl, customCode } = req.validatedData;
      const code = customCode || nanoid(6);

      // Check if custom code already exists
      if (customCode) {
        const exists = await LinkModel.codeExists(customCode);
        if (exists) {
          return res.status(409).json({ error: 'Custom code already exists' });
        }
      }

      const link = await LinkModel.create({ code, originalUrl });
      
      res.status(201).json({
        code: link.code,
        originalUrl: link.original_url,
        shortUrl: `${process.env.BASE_URL}/${link.code}`,
        clicks: link.clicks,
        createdAt: link.created_at
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all links
  static async getAllLinks(req, res, next) {
    try {
      const links = await LinkModel.findAll();
      
      const formattedLinks = links.map(link => ({
        code: link.code,
        originalUrl: link.original_url,
        clicks: link.clicks,
        createdAt: link.created_at,
        lastClicked: link.last_clicked
      }));
      
      res.json(formattedLinks);
    } catch (error) {
      next(error);
    }
  }

  // Get link stats
  static async getLinkStats(req, res, next) {
    try {
      const { code } = req.params;
      
      const link = await LinkModel.findByCode(code);
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.json({
        code: link.code,
        originalUrl: link.original_url,
        clicks: link.clicks,
        createdAt: link.created_at,
        lastClicked: link.last_clicked
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete link
  static async deleteLink(req, res, next) {
    try {
      const { code } = req.params;
      
      const deletedLink = await LinkModel.deleteByCode(code);
      if (!deletedLink) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Redirect to original URL
  static async redirectLink(req, res, next) {
    try {
      const { code } = req.params;
      
      const link = await LinkModel.incrementClick(code);
      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.redirect(302, link.original_url);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LinkController;