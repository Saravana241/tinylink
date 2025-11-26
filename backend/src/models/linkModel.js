const { pool } = require('../config/database');

class LinkModel {
  // Create a new short link
  static async create(linkData) {
    const { code, originalUrl } = linkData;
    const result = await pool.query(
      'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING *',
      [code, originalUrl]
    );
    return result.rows[0];
  }

  // Get all links
  static async findAll() {
    const result = await pool.query(
      'SELECT code, original_url, clicks, created_at, last_clicked FROM links ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Find link by code
  static async findByCode(code) {
    const result = await pool.query(
      'SELECT code, original_url, clicks, created_at, last_clicked FROM links WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  // Delete link by code
  static async deleteByCode(code) {
    const result = await pool.query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );
    return result.rows[0];
  }

  // Increment click count and update last_clicked
  static async incrementClick(code) {
    const result = await pool.query(
      'UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code = $1 RETURNING original_url',
      [code]
    );
    return result.rows[0];
  }

  // Check if code exists
  static async codeExists(code) {
    const result = await pool.query(
      'SELECT 1 FROM links WHERE code = $1',
      [code]
    );
    return result.rows.length > 0;
  }
}

module.exports = LinkModel;