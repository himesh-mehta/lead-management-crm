const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../db/schema');

let db;
let sql;

const connectDB = async () => {
  // Validate that DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not defined in server/.env');
    process.exit(1);
  }

  try {
    // Create Neon HTTP client
    sql = neon(process.env.DATABASE_URL);

    // Create Drizzle ORM instance with schema
    db = drizzle(sql, { schema });

    // Run a lightweight ping to verify connectivity
    await sql`SELECT 1`;
    console.log('✅ Neon PostgreSQL connected successfully');
  } catch (error) {
    console.error(`❌ Neon PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Getter so other modules can access db after connectDB() is called
const getDB = () => {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
};

module.exports = { connectDB, getDB };
