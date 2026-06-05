const pool = require('../config/db');
const { db } = require('../db');
const { leads } = require('../db/schema');
const { eq, ilike, or, and, sql, desc, asc } = require('drizzle-orm');

// ─── Email Validation ─────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Init Table + Trigger ─────────────────────────────────────────────────────
const initLeadsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) NOT NULL UNIQUE,
        phone       VARCHAR(50)  NOT NULL,
        company     VARCHAR(255) NOT NULL,
        status      VARCHAR(50)  NOT NULL DEFAULT 'New'
                    CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
        source      VARCHAR(100) DEFAULT 'Web',
        notes       TEXT DEFAULT '',
        gender      VARCHAR(50) DEFAULT 'Male',
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // Add source and gender columns if table already exists without them
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'Web';
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'Male';
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger only if it doesn't already exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'leads_updated_at'
        ) THEN
          CREATE TRIGGER leads_updated_at
          BEFORE UPDATE ON leads
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        END IF;
      END
      $$;
    `);

    console.log('✅ Leads table ready with source column');
  } finally {
    client.release();
  }
};

// ─── createLead ───────────────────────────────────────────────────────────────
const createLead = async (data) => {
  const { name, email, phone, company, status = 'New', source = 'Web', notes = '', gender = 'Male' } = data;

  // Validate required fields
  if (!name || !email || !phone || !company) {
    const err = new Error('name, email, phone, and company are required');
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    const err = new Error('Invalid email format');
    err.statusCode = 400;
    throw err;
  }

  const rows = await db.insert(leads).values({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    company: company.trim(),
    status,
    source,
    notes,
    gender,
  }).returning();

  return rows[0];
};

// ─── findAllLeads ─────────────────────────────────────────────────────────────
const findAllLeads = async ({ page = 1, limit = 10, status, sort = 'created_at' } = {}) => {
  const offset = (page - 1) * limit;

  // Whitelist sort columns
  const allowedSorts = ['created_at', 'updated_at', 'name', 'company', 'status'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';

  // Build filters
  let conditions = [];
  if (status) {
    conditions.push(eq(leads.status, status));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Order logic
  let orderClause = desc(leads.createdAt);
  if (sortColumn === 'name') orderClause = asc(leads.name);
  else if (sortColumn === 'company') orderClause = asc(leads.company);
  else if (sortColumn === 'status') orderClause = desc(leads.status);
  else if (sortColumn === 'updated_at') orderClause = desc(leads.updatedAt);

  const [leadsList, countRows] = await Promise.all([
    db.select().from(leads).where(whereClause).orderBy(orderClause).limit(limit).offset(offset),
    db.select({ count: sql`count(*)` }).from(leads).where(whereClause),
  ]);

  const total = parseInt(countRows[0].count || 0, 10);

  return {
    leads: leadsList,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── findLeadById ─────────────────────────────────────────────────────────────
const findLeadById = async (id) => {
  const rows = await db.select().from(leads).where(eq(leads.id, parseInt(id, 10)));
  return rows[0] || null;
};

// ─── updateLeadById ───────────────────────────────────────────────────────────
const updateLeadById = async (id, data) => {
  const allowedFields = ['name', 'email', 'phone', 'company', 'status', 'source', 'notes', 'gender'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      let value = data[field];
      if (field === 'email') {
        value = value.toLowerCase().trim();
        if (!EMAIL_REGEX.test(value)) {
          const err = new Error('Invalid email format');
          err.statusCode = 400;
          throw err;
        }
      }
      updateData[field] = value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    const err = new Error('No valid fields provided for update');
    err.statusCode = 400;
    throw err;
  }

  const rows = await db.update(leads)
    .set(updateData)
    .where(eq(leads.id, parseInt(id, 10)))
    .returning();

  return rows[0] || null;
};

// ─── deleteLeadById ───────────────────────────────────────────────────────────
const deleteLeadById = async (id) => {
  const rows = await db.delete(leads)
    .where(eq(leads.id, parseInt(id, 10)))
    .returning();
  return rows[0] || null;
};

// ─── searchLeads ──────────────────────────────────────────────────────────────
const searchLeads = async (q) => {
  if (!q || q.trim() === '') return [];

  const pattern = `%${q.trim()}%`;

  return db.select().from(leads)
    .where(
      or(
        ilike(leads.name, pattern),
        ilike(leads.email, pattern),
        ilike(leads.company, pattern),
        ilike(leads.phone, pattern)
      )
    )
    .orderBy(desc(leads.createdAt));
};

// ─── getLeadStats ─────────────────────────────────────────────────────────────
const getLeadStats = async () => {
  const [totalRes, byStatusRes, thisMonthRes, convertedRes] = await Promise.all([
    db.select({ count: sql`count(*)` }).from(leads),
    db.select({ status: leads.status, count: sql`count(*)` }).from(leads).groupBy(leads.status),
    db.select({ count: sql`count(*)` }).from(leads).where(
      sql`date_trunc('month', ${leads.createdAt}) = date_trunc('month', now())`
    ),
    db.select({ count: sql`count(*)` }).from(leads).where(eq(leads.status, 'Converted')),
  ]);

  const total = parseInt(totalRes[0]?.count || 0, 10);
  const thisMonth = parseInt(thisMonthRes[0]?.count || 0, 10);
  const converted = parseInt(convertedRes[0]?.count || 0, 10);

  const byStatus = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Converted: 0,
    Lost: 0,
  };

  byStatusRes.forEach((row) => {
    if (row.status) {
      byStatus[row.status] = parseInt(row.count, 10);
    }
  });

  const conversionRate = total > 0
    ? ((converted / total) * 100).toFixed(1)
    : '0.0';

  return {
    total,
    thisMonth,
    conversionRate: `${conversionRate}%`,
    byStatus,
  };
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  initLeadsTable,
  createLead,
  findAllLeads,
  findLeadById,
  updateLeadById,
  deleteLeadById,
  searchLeads,
  getLeadStats,
};
