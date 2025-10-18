const { Pool } = require('pg');

// Environment-based database configuration
function getDatabaseConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBTP = process.env.VCAP_SERVICES || process.env.BTP_DEPLOYMENT;
  
  if (isProduction || isBTP) {
    // BTP/Production configuration
    return {
      host: process.env.DB_HOST || 'postgres-0051ecc1-bd29-4b6e-88ad-56e61bdd0d29.cqryblsdrbcs.us-east-1.rds.amazonaws.com',
      port: parseInt(process.env.DB_PORT) || 7323,
      database: process.env.DB_NAME || 'IthxfFGAZuJr',
      user: process.env.DB_USER || 'fa07233af456',
      password: process.env.DB_PASSWORD || '9bc0e5cfedf486ad789ac9c6a3ac9254',
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      query_timeout: 10000,
      statement_timeout: 10000,
    };
  } else {
    // Local development configuration
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || 'sap_basis_cockpit',
      user: process.env.DB_USER || 'sap_user',
      password: process.env.DB_PASSWORD || 'sap_password',
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
      statement_timeout: 10000,
    };
  }
}

const dbConfig = getDatabaseConfig();

const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  const env = process.env.NODE_ENV || 'development';
  const isLocal = !process.env.VCAP_SERVICES && !process.env.BTP_DEPLOYMENT;
  console.log(`Connected to PostgreSQL database (${isLocal ? 'local' : 'hosted'} - ${env})`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
