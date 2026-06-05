const pool = require('../config/db');

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
        notes       TEXT DEFAULT '',
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
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

    console.log('✅ Leads table ready');
  } finally {
    client.release();
  }
};

// ─── createLead ───────────────────────────────────────────────────────────────
/**
 * Insert a new lead into the database.
 * @param {{ name, email, phone, company, status?, notes? }} data
 */
const createLead = async (data) => {
  const { name, email, phone, company, status = 'New', notes = '' } = data;

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

  const { rows } = await pool.query(
    `INSERT INTO leads (name, email, phone, company, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name.trim(), normalizedEmail, phone.trim(), company.trim(), status, notes]
  );

  return rows[0];
};

// ─── findAllLeads ─────────────────────────────────────────────────────────────
/**
 * Paginated list of leads with optional status filter and sorting.
 * @param {{ page?, limit?, status?, sort? }} options
 */
const findAllLeads = async ({ page = 1, limit = 10, status, sort = 'created_at' } = {}) => {
  const offset = (page - 1) * limit;

  // Whitelist sort columns to prevent SQL injection
  const allowedSorts = ['created_at', 'updated_at', 'name', 'company', 'status'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';

  let query, countQuery, params, countParams;

  if (status) {
    query = `
      SELECT * FROM leads
      WHERE status = $1
      ORDER BY ${sortColumn} DESC
      LIMIT $2 OFFSET $3
    `;
    countQuery = `SELECT COUNT(*) FROM leads WHERE status = $1`;
    params = [status, limit, offset];
    countParams = [status];
  } else {
    query = `
      SELECT * FROM leads
      ORDER BY ${sortColumn} DESC
      LIMIT $1 OFFSET $2
    `;
    countQuery = `SELECT COUNT(*) FROM leads`;
    params = [limit, offset];
    countParams = [];
  }

  const [{ rows: leads }, { rows: countRows }] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  const total = parseInt(countRows[0].count, 10);

  return {
    leads,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── findLeadById ─────────────────────────────────────────────────────────────
/**
 * Find a single lead by its ID.
 * @param {number|string} id
 */
const findLeadById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM leads WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

// ─── updateLeadById ───────────────────────────────────────────────────────────
/**
 * Partially update a lead — only provided fields are updated.
 * @param {number|string} id
 * @param {object} data
 */
const updateLeadById = async (id, data) => {
  const allowedFields = ['name', 'email', 'phone', 'company', 'status', 'notes'];
  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      // Normalize email if being updated
      const value = field === 'email'
        ? data[field].toLowerCase().trim()
        : data[field];

      if (field === 'email' && !EMAIL_REGEX.test(value)) {
        const err = new Error('Invalid email format');
        err.statusCode = 400;
        throw err;
      }

      updates.push(`${field} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    const err = new Error('No valid fields provided for update');
    err.statusCode = 400;
    throw err;
  }

  values.push(id); // last param is the WHERE id = $N

  const { rows } = await pool.query(
    `UPDATE leads
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return rows[0] || null;
};

// ─── deleteLeadById ───────────────────────────────────────────────────────────
/**
 * Delete a lead by ID and return the deleted record.
 * @param {number|string} id
 */
const deleteLeadById = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM leads WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
};

// ─── searchLeads ──────────────────────────────────────────────────────────────
/**
 * Full-text search across name, email, and company (case-insensitive).
 * @param {string} q - search term
 */
const searchLeads = async (q) => {
  if (!q || q.trim() === '') return [];

  const pattern = `%${q.trim()}%`;

  const { rows } = await pool.query(
    `SELECT * FROM leads
     WHERE name    ILIKE $1
        OR email   ILIKE $1
        OR company ILIKE $1
     ORDER BY created_at DESC`,
    [pattern]
  );

  return rows;
};

// ─── getLeadStats ─────────────────────────────────────────────────────────────
/**
 * Aggregate stats: total, by status, this month, conversion rate.
 */
const getLeadStats = async () => {
  const [totalRes, byStatusRes, thisMonthRes, convertedRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM leads`),
    pool.query(`SELECT status, COUNT(*) AS count FROM leads GROUP BY status ORDER BY count DESC`),
    pool.query(`
      SELECT COUNT(*) AS count FROM leads
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
    `),
    pool.query(`SELECT COUNT(*) AS count FROM leads WHERE status = 'Converted'`),
  ]);

  const total       = parseInt(totalRes.rows[0].total, 10);
  const thisMonth   = parseInt(thisMonthRes.rows[0].count, 10);
  const converted   = parseInt(convertedRes.rows[0].count, 10);

  // Build status breakdown as a keyed object
  const byStatus = {};
  for (const row of byStatusRes.rows) {
    byStatus[row.status] = parseInt(row.count, 10);
  }

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
