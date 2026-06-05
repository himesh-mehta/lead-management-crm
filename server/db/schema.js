const { pgTable, serial, text, varchar, timestamp } = require('drizzle-orm/pg-core');

// ─── Leads Table ──────────────────────────────────────────────────────────────
const leads = pgTable('leads', {
  id:          serial('id').primaryKey(),
  name:        varchar('name', { length: 255 }).notNull(),
  email:       varchar('email', { length: 255 }).notNull().unique(),
  phone:       varchar('phone', { length: 50 }).notNull(),
  company:     varchar('company', { length: 255 }).notNull(),
  status:      varchar('status', { length: 50 }).default('New'),   // New | Contacted | Qualified | Converted | Lost
  source:      varchar('source', { length: 100 }).default('Web'),  // Web | Referral | Cold-Call | etc.
  notes:       text('notes').default(''),
  gender:      varchar('gender', { length: 50 }).default('Male'),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});

// ─── Export ───────────────────────────────────────────────────────────────────
module.exports = { leads };
