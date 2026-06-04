const { defineConfig } = require('drizzle-kit');
require('dotenv').config({ path: './server/.env' });

module.exports = defineConfig({
  schema: './server/db/schema.js',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
