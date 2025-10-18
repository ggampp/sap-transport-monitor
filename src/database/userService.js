const pool = require('../../config/database');

class UserService {
  // Get all users
  async getAllUsers() {
    const query = `
      SELECT u.*, 
             ARRAY_AGG(DISTINCT p.profile_name) FILTER (WHERE p.profile_name IS NOT NULL) as profiles,
             ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN profiles p ON up.profile_id = p.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get user by ID
  async getUserById(id) {
    const query = `
      SELECT u.*, 
             ARRAY_AGG(DISTINCT p.profile_name) FILTER (WHERE p.profile_name IS NOT NULL) as profiles,
             ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN profiles p ON up.profile_id = p.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create user
  async createUser(userData) {
    const { username, fullName, email, department, status = 'active' } = userData;
    const query = `
      INSERT INTO users (username, full_name, email, department, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [username, fullName, email, department, status]);
    return result.rows[0];
  }

  // Update user
  async updateUser(id, userData) {
    const { fullName, email, department, status } = userData;
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (fullName) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (email) {
      fields.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (department) {
      fields.push(`department = $${paramCount++}`);
      values.push(department);
    }
    if (status) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete user
  async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Assign profile to user
  async assignProfile(userId, profileName, assignedBy = 'system') {
    const query = `
      INSERT INTO user_profiles (user_id, profile_id, assigned_by)
      SELECT $1, p.id, $3
      FROM profiles p
      WHERE p.profile_name = $2
      ON CONFLICT (user_id, profile_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, profileName, assignedBy]);
    return result.rows[0];
  }

  // Remove profile from user
  async removeProfile(userId, profileName) {
    const query = `
      DELETE FROM user_profiles
      WHERE user_id = $1 AND profile_id = (
        SELECT id FROM profiles WHERE profile_name = $2
      )
    `;
    await pool.query(query, [userId, profileName]);
  }

  // Assign role to user
  async assignRole(userId, roleName, assignedBy = 'system') {
    const query = `
      INSERT INTO user_roles (user_id, role_id, assigned_by)
      SELECT $1, r.id, $3
      FROM roles r
      WHERE r.role_name = $2
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, roleName, assignedBy]);
    return result.rows[0];
  }

  // Remove role from user
  async removeRole(userId, roleName) {
    const query = `
      DELETE FROM user_roles
      WHERE user_id = $1 AND role_id = (
        SELECT id FROM roles WHERE role_name = $2
      )
    `;
    await pool.query(query, [userId, roleName]);
  }

  // Get SOX review data
  async getSoxReview() {
    const query = `
      SELECT u.id, u.username, u.full_name, u.department, u.last_login, u.status,
             ARRAY_AGG(DISTINCT p.profile_name) FILTER (WHERE p.profile_name LIKE '%ADMIN%' OR p.profile_name LIKE '%SUPER%') as critical_profiles,
             ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name LIKE '%ADMIN%' OR r.role_name LIKE '%SUPER%') as critical_roles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN profiles p ON up.profile_id = p.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE (p.profile_name LIKE '%ADMIN%' OR p.profile_name LIKE '%SUPER%' OR 
             r.role_name LIKE '%ADMIN%' OR r.role_name LIKE '%SUPER%')
      GROUP BY u.id, u.username, u.full_name, u.department, u.last_login, u.status
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({
      ...row,
      needsReview: !row.last_login || new Date(row.last_login) < new Date(Date.now() - 90*24*60*60*1000)
    }));
  }

  // Get audit logs
  async getAuditLogs(filters = {}) {
    let query = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.action) {
      query += ` AND al.action = $${paramCount++}`;
      values.push(filters.action);
    }
    if (filters.userId) {
      query += ` AND al.user_id = $${paramCount++}`;
      values.push(filters.userId);
    }

    query += ` ORDER BY al.timestamp DESC`;
    
    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(parseInt(filters.limit));
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Log audit event
  async logAudit(action, userId, details, adminUser = 'system') {
    const query = `
      INSERT INTO audit_logs (action, user_id, admin_user, details)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [action, userId, adminUser, details]);
    return result.rows[0];
  }

  // Update user login
  async updateUserLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get metrics
  async getMetrics() {
    const queries = {
      totalUsers: 'SELECT COUNT(*) as count FROM users',
      activeUsers: 'SELECT COUNT(*) as count FROM users WHERE status = $1',
      blockedUsers: 'SELECT COUNT(*) as count FROM users WHERE status = $1',
      usersCreated: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      usersModified: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      profilesAssigned: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      profilesRemoved: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      rolesAssigned: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      rolesRemoved: 'SELECT COUNT(*) as count FROM audit_logs WHERE action = $1',
      auditsCompleted: 'SELECT COUNT(*) as count FROM audit_logs WHERE action LIKE $1'
    };

    const metrics = {};
    
    for (const [key, query] of Object.entries(queries)) {
      let params = [];
      if (key === 'activeUsers' || key === 'blockedUsers') {
        params = [key === 'activeUsers' ? 'active' : 'blocked'];
      } else if (key === 'usersCreated') {
        params = ['USER_CREATED'];
      } else if (key === 'usersModified') {
        params = ['USER_MODIFIED'];
      } else if (key === 'profilesAssigned') {
        params = ['PROFILE_ASSIGNED'];
      } else if (key === 'profilesRemoved') {
        params = ['PROFILE_REMOVED'];
      } else if (key === 'rolesAssigned') {
        params = ['ROLE_ASSIGNED'];
      } else if (key === 'rolesRemoved') {
        params = ['ROLE_REMOVED'];
      } else if (key === 'auditsCompleted') {
        params = ['%AUDIT%'];
      }

      const result = await pool.query(query, params);
      metrics[key] = parseInt(result.rows[0].count);
    }

    return metrics;
  }
}

module.exports = new UserService();
