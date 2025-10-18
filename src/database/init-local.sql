-- Local development sample data for SAP Basis Cockpit

-- Insert sample users
INSERT INTO users (username, full_name, email, department, status) VALUES
('admin', 'Administrator', 'admin@company.com', 'IT', 'active'),
('developer1', 'João Silva', 'joao@company.com', 'Development', 'active'),
('developer2', 'Maria Santos', 'maria@company.com', 'Development', 'active'),
('user1', 'Carlos Oliveira', 'carlos@company.com', 'Finance', 'active'),
('user2', 'Ana Costa', 'ana@company.com', 'HR', 'blocked')
ON CONFLICT (username) DO NOTHING;

-- Insert sample profiles
INSERT INTO profiles (profile_name, description, category) VALUES
('SAP_ALL', 'Acesso total ao sistema', 'administrative'),
('SAP_DEVELOPER', 'Perfil para desenvolvedores', 'technical'),
('SAP_USER', 'Usuário padrão', 'functional'),
('SAP_ADMIN', 'Administrador do sistema', 'administrative'),
('SAP_FINANCE', 'Usuário financeiro', 'functional')
ON CONFLICT (profile_name) DO NOTHING;

-- Insert sample roles
INSERT INTO roles (role_name, description, type) VALUES
('ADMIN_ROLE', 'Papel administrativo', 'authorization'),
('DEVELOPER_ROLE', 'Papel de desenvolvedor', 'business'),
('USER_ROLE', 'Papel de usuário', 'system'),
('FINANCE_ROLE', 'Papel financeiro', 'business'),
('AUDIT_ROLE', 'Papel de auditoria', 'authorization')
ON CONFLICT (role_name) DO NOTHING;

-- Insert sample transports
INSERT INTO transports (request_id, system, owner, status) VALUES
('TRK900001', 'DEV', 'João Silva', 'done'),
('TRK900002', 'QAS', 'Maria Santos', 'in-progress'),
('TRK900003', 'PRD', 'Carlos Oliveira', 'pending'),
('TRK900004', 'DEV', 'Ana Costa', 'error'),
('TRK900005', 'QAS', 'João Silva', 'done'),
('TRK900006', 'PRD', 'Maria Santos', 'done'),
('TRK900007', 'DEV', 'Carlos Oliveira', 'in-progress'),
('TRK900008', 'QAS', 'Ana Costa', 'pending');

-- Insert sample SAP notes
INSERT INTO sap_notes (note_id, system, owner, status) VALUES
('1234567', 'DEV', 'João Silva', 'done'),
('2345678', 'QAS', 'Maria Santos', 'in-progress'),
('3456789', 'PRD', 'Carlos Oliveira', 'pending'),
('4567890', 'DEV', 'Ana Costa', 'error'),
('5678901', 'QAS', 'João Silva', 'done');

-- Insert sample upgrades
INSERT INTO upgrades (name, maintenance_window, owner, status) VALUES
('S4 Upgrade 2024', '2024-12-15 22:00', 'João Silva', 'pending'),
('HANA Migration', '2024-11-20 18:00', 'Maria Santos', 'in-progress'),
('Security Patch', '2024-10-30 20:00', 'Carlos Oliveira', 'done'),
('Fiori Upgrade', '2024-12-01 16:00', 'Ana Costa', 'pending');

-- Assign profiles to users
INSERT INTO user_profiles (user_id, profile_id, assigned_by)
SELECT u.id, p.id, 'system'
FROM users u, profiles p
WHERE (u.username = 'admin' AND p.profile_name = 'SAP_ALL')
   OR (u.username = 'admin' AND p.profile_name = 'SAP_ADMIN')
   OR (u.username = 'developer1' AND p.profile_name = 'SAP_DEVELOPER')
   OR (u.username = 'developer2' AND p.profile_name = 'SAP_DEVELOPER')
   OR (u.username = 'user1' AND p.profile_name = 'SAP_USER')
   OR (u.username = 'user2' AND p.profile_name = 'SAP_FINANCE')
ON CONFLICT (user_id, profile_id) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT u.id, r.id, 'system'
FROM users u, roles r
WHERE (u.username = 'admin' AND r.role_name = 'ADMIN_ROLE')
   OR (u.username = 'developer1' AND r.role_name = 'DEVELOPER_ROLE')
   OR (u.username = 'developer2' AND r.role_name = 'DEVELOPER_ROLE')
   OR (u.username = 'user1' AND r.role_name = 'USER_ROLE')
   OR (u.username = 'user2' AND r.role_name = 'FINANCE_ROLE')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insert sample audit logs
INSERT INTO audit_logs (action, user_id, admin_user, details) VALUES
('USER_CREATED', (SELECT id FROM users WHERE username = 'admin'), 'system', '{"username": "admin", "fullName": "Administrator"}'),
('PROFILE_ASSIGNED', (SELECT id FROM users WHERE username = 'developer1'), 'system', '{"profileName": "SAP_DEVELOPER"}'),
('ROLE_ASSIGNED', (SELECT id FROM users WHERE username = 'developer1'), 'system', '{"roleName": "DEVELOPER_ROLE"}'),
('USER_LOGIN', (SELECT id FROM users WHERE username = 'admin'), 'system', '{"username": "admin"}'),
('USER_MODIFIED', (SELECT id FROM users WHERE username = 'user1'), 'admin', '{"changes": {"status": "active"}}'),
('PROFILE_REMOVED', (SELECT id FROM users WHERE username = 'user2'), 'admin', '{"profileName": "SAP_USER"}'),
('ROLE_ASSIGNED', (SELECT id FROM users WHERE username = 'user2'), 'admin', '{"roleName": "FINANCE_ROLE"}');
