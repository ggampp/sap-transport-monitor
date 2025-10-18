const pool = require('../../config/database');

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connectionPromise = this.testConnection();
  }

  async testConnection() {
    try {
      await pool.query('SELECT 1');
      this.isConnected = true;
      console.log('Database connection established');
      return true;
    } catch (error) {
      this.isConnected = false;
      console.log('Database connection not available, using JSON storage');
      return false;
    }
  }

  async query(sql, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return await pool.query(sql, params);
  }

  async isAvailable() {
    if (!this.isConnected) {
      await this.connectionPromise;
    }
    return this.isConnected;
  }
}

module.exports = new DatabaseService();
