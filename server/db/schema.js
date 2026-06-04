const { pgTable, serial, text, varchar, timestamp, integer } = require('drizzle-orm/pg-core');

// ─── Leads Table ──────────────────────────────────────────────────────────────
const leads = pgTable('leads', {
  id:          serial('id').primaryKey(),
  name:        varchar('name', { length: 255 }).notNull(),
  email:       varchar('email', { length: 255 }).notNull().unique(),
  phone:       varchar('phone', { length: 20 }),
  company:     varchar('company', { length: 255 }),
  status:      varchar('status', { length: 50 }).default('new'),   // new | contacted | qualified | lost | won
  source:      varchar('source', { length: 100 }),                  // web | referral | cold-call | etc.
  notes:       text('notes'),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = { leads };
