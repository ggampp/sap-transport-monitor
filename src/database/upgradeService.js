const pool = require('../../config/database');

class UpgradeService {
  // Get all upgrades
  async getAllUpgrades() {
    const query = 'SELECT * FROM upgrades ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get upgrade by ID
  async getUpgradeById(id) {
    const query = 'SELECT * FROM upgrades WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create upgrade
  async createUpgrade(upgradeData) {
    const { name, window, owner, status = 'pending' } = upgradeData;
    const query = `
      INSERT INTO upgrades (name, window, owner, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [name, window, owner, status]);
    return result.rows[0];
  }

  // Update upgrade
  async updateUpgrade(id, upgradeData) {
    const { status } = upgradeData;
    const query = `
      UPDATE upgrades 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Delete upgrade
  async deleteUpgrade(id) {
    const query = 'DELETE FROM upgrades WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = new UpgradeService();
