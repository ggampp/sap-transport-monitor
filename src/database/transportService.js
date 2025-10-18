const pool = require('../../config/database');

class TransportService {
  // Get all transports with optional date filtering
  async getAllTransports(filters = {}) {
    let query = 'SELECT * FROM transports WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.from) {
      query += ` AND created_at >= $${paramCount++}`;
      values.push(filters.from);
    }
    if (filters.to) {
      query += ` AND created_at <= $${paramCount++}`;
      values.push(filters.to);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get transport by ID
  async getTransportById(id) {
    const query = 'SELECT * FROM transports WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create transport
  async createTransport(transportData) {
    const { requestId, system, owner, status = 'pending' } = transportData;
    const query = `
      INSERT INTO transports (request_id, system, owner, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [requestId, system, owner, status]);
    return result.rows[0];
  }

  // Update transport
  async updateTransport(id, transportData) {
    const { status } = transportData;
    const query = `
      UPDATE transports 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Delete transport
  async deleteTransport(id) {
    const query = 'DELETE FROM transports WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Get analytics data
  async getAnalytics(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.from) {
      whereClause += ` AND created_at >= $${paramCount++}`;
      values.push(filters.from);
    }
    if (filters.to) {
      whereClause += ` AND created_at <= $${paramCount++}`;
      values.push(filters.to);
    }

    // Get totals by status
    const totalsQuery = `
      SELECT status, COUNT(*) as count
      FROM transports ${whereClause}
      GROUP BY status
    `;
    const totalsResult = await pool.query(totalsQuery, values);
    const totalsByStatus = {};
    totalsResult.rows.forEach(row => {
      totalsByStatus[row.status] = parseInt(row.count);
    });

    // Get per day per status
    const perDayQuery = `
      SELECT 
        DATE(created_at) as day,
        status,
        COUNT(*) as count
      FROM transports ${whereClause}
      GROUP BY DATE(created_at), status
      ORDER BY day
    `;
    const perDayResult = await pool.query(perDayQuery, values);
    
    const perDayStatus = {};
    perDayResult.rows.forEach(row => {
      if (!perDayStatus[row.day]) {
        perDayStatus[row.day] = {};
      }
      perDayStatus[row.day][row.status] = parseInt(row.count);
    });

    const days = Object.keys(perDayStatus).sort();
    const statuses = [...new Set(perDayResult.rows.map(row => row.status))].sort();
    const series = statuses.map(status => ({
      status,
      data: days.map(day => perDayStatus[day][status] || 0)
    }));

    return {
      from: filters.from,
      to: filters.to,
      totalsByStatus,
      days,
      series
    };
  }
}

module.exports = new TransportService();
