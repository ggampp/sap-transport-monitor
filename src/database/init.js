const dbService = require('./dbService');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test connection first
    if (!(await dbService.isAvailable())) {
      throw new Error('Database not available');
    }
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await dbService.query(schema);
    console.log('Database schema created successfully');
    
    // Insert sample data
    await insertSampleData();
    console.log('Sample data inserted successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function insertSampleData() {
  try {
    // Insert sample users
    const users = [
      ['admin', 'Administrator', 'admin@company.com', 'IT', 'active'],
      ['developer1', 'João Silva', 'joao@company.com', 'Development', 'active'],
      ['developer2', 'Maria Santos', 'maria@company.com', 'Development', 'active'],
      ['user1', 'Carlos Oliveira', 'carlos@company.com', 'Finance', 'active'],
      ['user2', 'Ana Costa', 'ana@company.com', 'HR', 'blocked']
    ];
    
    for (const [username, fullName, email, department, status] of users) {
      await dbService.query(
        'INSERT INTO users (username, full_name, email, department, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING',
        [username, fullName, email, department, status]
      );
    }
    
    // Insert sample profiles
    const profiles = [
      ['SAP_ALL', 'Acesso total ao sistema', 'administrative'],
      ['SAP_DEVELOPER', 'Perfil para desenvolvedores', 'technical'],
      ['SAP_USER', 'Usuário padrão', 'functional'],
      ['SAP_ADMIN', 'Administrador do sistema', 'administrative'],
      ['SAP_FINANCE', 'Usuário financeiro', 'functional']
    ];
    
    for (const [profileName, description, category] of profiles) {
      await dbService.query(
        'INSERT INTO profiles (profile_name, description, category) VALUES ($1, $2, $3) ON CONFLICT (profile_name) DO NOTHING',
        [profileName, description, category]
      );
    }
    
    // Insert sample roles
    const roles = [
      ['ADMIN_ROLE', 'Papel administrativo', 'authorization'],
      ['DEVELOPER_ROLE', 'Papel de desenvolvedor', 'business'],
      ['USER_ROLE', 'Papel de usuário', 'system'],
      ['FINANCE_ROLE', 'Papel financeiro', 'business'],
      ['AUDIT_ROLE', 'Papel de auditoria', 'authorization']
    ];
    
    for (const [roleName, description, type] of roles) {
      await dbService.query(
        'INSERT INTO roles (role_name, description, type) VALUES ($1, $2, $3) ON CONFLICT (role_name) DO NOTHING',
        [roleName, description, type]
      );
    }
    
    // Insert sample transports
    const transports = [
      ['TRK900001', 'DEV', 'João Silva', 'done'],
      ['TRK900002', 'QAS', 'Maria Santos', 'in-progress'],
      ['TRK900003', 'PRD', 'Carlos Oliveira', 'pending'],
      ['TRK900004', 'DEV', 'Ana Costa', 'error'],
      ['TRK900005', 'QAS', 'João Silva', 'done']
    ];
    
    for (const [requestId, system, owner, status] of transports) {
      await dbService.query(
        'INSERT INTO transports (request_id, system, owner, status) VALUES ($1, $2, $3, $4)',
        [requestId, system, owner, status]
      );
    }
    
    // Insert sample SAP notes
    const notes = [
      ['1234567', 'DEV', 'João Silva', 'done'],
      ['2345678', 'QAS', 'Maria Santos', 'in-progress'],
      ['3456789', 'PRD', 'Carlos Oliveira', 'pending'],
      ['4567890', 'DEV', 'Ana Costa', 'error']
    ];
    
    for (const [noteId, system, owner, status] of notes) {
      await dbService.query(
        'INSERT INTO sap_notes (note_id, system, owner, status) VALUES ($1, $2, $3, $4)',
        [noteId, system, owner, status]
      );
    }
    
    // Insert sample upgrades
    const upgrades = [
      ['S4 Upgrade 2024', '2024-12-15 22:00', 'João Silva', 'pending'],
      ['HANA Migration', '2024-11-20 18:00', 'Maria Santos', 'in-progress'],
      ['Security Patch', '2024-10-30 20:00', 'Carlos Oliveira', 'done']
    ];
    
    for (const [name, window, owner, status] of upgrades) {
      await dbService.query(
        'INSERT INTO upgrades (name, maintenance_window, owner, status) VALUES ($1, $2, $3, $4)',
        [name, window, owner, status]
      );
    }
    
    // Assign profiles to users
    const userProfiles = [
      ['admin', 'SAP_ALL'],
      ['admin', 'SAP_ADMIN'],
      ['developer1', 'SAP_DEVELOPER'],
      ['developer2', 'SAP_DEVELOPER'],
      ['user1', 'SAP_USER'],
      ['user2', 'SAP_FINANCE']
    ];
    
    for (const [username, profileName] of userProfiles) {
      await dbService.query(`
        INSERT INTO user_profiles (user_id, profile_id, assigned_by)
        SELECT u.id, p.id, 'system'
        FROM users u, profiles p
        WHERE u.username = $1 AND p.profile_name = $2
        ON CONFLICT (user_id, profile_id) DO NOTHING
      `, [username, profileName]);
    }
    
    // Assign roles to users
    const userRoles = [
      ['admin', 'ADMIN_ROLE'],
      ['developer1', 'DEVELOPER_ROLE'],
      ['developer2', 'DEVELOPER_ROLE'],
      ['user1', 'USER_ROLE'],
      ['user2', 'FINANCE_ROLE']
    ];
    
    for (const [username, roleName] of userRoles) {
      await dbService.query(`
        INSERT INTO user_roles (user_id, role_id, assigned_by)
        SELECT u.id, r.id, 'system'
        FROM users u, roles r
        WHERE u.username = $1 AND r.role_name = $2
        ON CONFLICT (user_id, role_id) DO NOTHING
      `, [username, roleName]);
    }
    
    // Insert sample audit logs
    const auditLogs = [
      ['USER_CREATED', 'admin', 'system', '{"username": "admin", "fullName": "Administrator"}'],
      ['PROFILE_ASSIGNED', 'developer1', 'system', '{"profileName": "SAP_DEVELOPER"}'],
      ['ROLE_ASSIGNED', 'developer1', 'system', '{"roleName": "DEVELOPER_ROLE"}'],
      ['USER_LOGIN', 'admin', 'system', '{"username": "admin"}'],
      ['USER_MODIFIED', 'user1', 'admin', '{"changes": {"status": "active"}}']
    ];
    
    for (const [action, userId, adminUser, details] of auditLogs) {
      const userResult = await dbService.query('SELECT id FROM users WHERE username = $1', [userId]);
      const userIdUuid = userResult.rows[0]?.id;
      
      await dbService.query(
        'INSERT INTO audit_logs (action, user_id, admin_user, details) VALUES ($1, $2, $3, $4)',
        [action, userIdUuid, adminUser, JSON.parse(details)]
      );
    }
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
