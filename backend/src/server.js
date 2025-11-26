const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const Joi = require('joi');
const { nanoid } = require('nanoid');
require('dotenv').config(); // Add this line at the very top


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_clicked TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_code ON links(code);
    `);
    console.log('Database initialized');
  } finally {
    client.release();
  }
};

// Validation schemas
const createLinkSchema = Joi.object({
  originalUrl: Joi.string().uri().required(),
  customCode: Joi.string().pattern(/^[A-Za-z0-9]{6,8}$/).optional()
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Create short link
app.post('/api/links', async (req, res) => {
  try {
    const { error, value } = createLinkSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { originalUrl, customCode } = value;
    const code = customCode || nanoid(6);

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING *',
        [code, originalUrl]
      );
      
      res.status(201).json({
        code: result.rows[0].code,
        originalUrl: result.rows[0].original_url,
        shortUrl: `${process.env.BASE_URL}/${result.rows[0].code}`,
        clicks: result.rows[0].clicks,
        createdAt: result.rows[0].created_at
      });
    } catch (dbError) {
      if (dbError.code === '23505') {
        return res.status(409).json({ error: 'Custom code already exists' });
      }
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all links
app.get('/api/links', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT code, original_url, clicks, created_at, last_clicked FROM links ORDER BY created_at DESC'
      );
      
      const links = result.rows.map(row => ({
        code: row.code,
        originalUrl: row.original_url,
        clicks: row.clicks,
        createdAt: row.created_at,
        lastClicked: row.last_clicked
      }));
      
      res.json(links);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get link stats
app.get('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT code, original_url, clicks, created_at, last_clicked FROM links WHERE code = $1',
        [code]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      const link = result.rows[0];
      res.json({
        code: link.code,
        originalUrl: link.original_url,
        clicks: link.clicks,
        createdAt: link.created_at,
        lastClicked: link.last_clicked
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching link stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete link
app.delete('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM links WHERE code = $1 RETURNING *',
        [code]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code = $1 RETURNING original_url',
        [code]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Link not found' });
      }
      
      res.redirect(302, result.rows[0].original_url);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});