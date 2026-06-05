const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Required for @neondatabase/serverless Pool in Node.js (non-edge) environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in server/.env');
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Neon PostgreSQL Pool connected successfully');
    client.release();
  } catch (err) {
    console.error(`❌ Neon PostgreSQL Pool connection error: ${err.message}`);
    process.exit(1);
  }
})();

module.exports = pool;
