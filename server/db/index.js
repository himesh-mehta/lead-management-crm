const { drizzle } = require('drizzle-orm/node-postgres');
const pool = require('../config/db');
const schema = require('./schema');

// Initialize Drizzle ORM db client
const db = drizzle(pool, { schema });

module.exports = { db };
