const pool = require('../config/db');
const { db } = require('../db');
const { users, leads, leadActivities } = require('../db/schema');
const { eq, ilike, or, and, sql, desc, asc } = require('drizzle-orm');

// ─── Email Validation ─────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Init Table + Trigger ─────────────────────────────────────────────────────
const initLeadsTable = async () => {
  const client = await pool.connect();
  try {
    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create leads table
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

    // Add source, gender, estimated_value and user_id columns if table already exists without them
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'Web';
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'Male';
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value INTEGER DEFAULT 0;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
    `);

    // Create lead_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_activities (
        id          SERIAL PRIMARY KEY,
        lead_id     INTEGER NOT NULL,
        lead_name   VARCHAR(255) NOT NULL,
        action      VARCHAR(100) NOT NULL,
        details     TEXT DEFAULT '',
        created_at  TIMESTAMP DEFAULT NOW()
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

    console.log('✅ Leads and Users tables ready with user isolation columns');
  } finally {
    client.release();
  }
};

// ─── createLead ───────────────────────────────────────────────────────────────
const createLead = async (data, userId) => {
  const { name, email, phone, company, status = 'New', source = 'Web', notes = '', gender = 'Male', estimatedValue = 0 } = data;

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
    estimatedValue: Number(estimatedValue) || 0,
    userId: userId || null,
  }).returning();

  const createdLead = rows[0];

  // Log activity
  if (createdLead) {
    await db.insert(leadActivities).values({
      leadId: createdLead.id,
      leadName: createdLead.name,
      action: createdLead.status === 'Converted' ? 'Converted' : 'Created',
      details: createdLead.status === 'Converted' 
        ? `Lead converted successfully with value $${createdLead.estimatedValue || 0}`
        : `Lead created with status "${createdLead.status}" and value $${createdLead.estimatedValue || 0}`,
    }).catch(err => console.error('Failed to log lead activity:', err.message));
  }

  return createdLead;
};

// ─── findAllLeads ─────────────────────────────────────────────────────────────
const findAllLeads = async ({ page = 1, limit = 10, status, sort = 'created_at', userId } = {}) => {
  const offset = (page - 1) * limit;

  // Whitelist sort columns
  const allowedSorts = ['created_at', 'updated_at', 'name', 'company', 'status'];
  const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';

  // Build filters
  let conditions = [];
  if (userId) {
    conditions.push(eq(leads.userId, userId));
  }
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
const findLeadById = async (id, userId) => {
  let condition = eq(leads.id, parseInt(id, 10));
  if (userId) {
    condition = and(condition, eq(leads.userId, userId));
  }
  const rows = await db.select().from(leads).where(condition);
  return rows[0] || null;
};

// ─── updateLeadById ───────────────────────────────────────────────────────────
const updateLeadById = async (id, data, userId) => {
  const allowedFields = ['name', 'email', 'phone', 'company', 'status', 'source', 'notes', 'gender', 'estimatedValue'];
  const updateData = {};

  // Fetch current state for activity logging
  const currentLead = await findLeadById(id, userId);
  if (!currentLead) return null;

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
      if (field === 'estimatedValue') {
        value = Number(value) || 0;
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
    .where(and(eq(leads.id, parseInt(id, 10)), eq(leads.userId, userId)))
    .returning();

  const updatedLead = rows[0] || null;

  // Log activity if status or value changed
  if (updatedLead && currentLead) {
    let action = 'Updated';
    let details = 'Lead details updated';

    if (currentLead.status !== updatedLead.status) {
      if (updatedLead.status === 'Converted') {
        action = 'Converted';
        details = `Lead converted successfully with value $${updatedLead.estimatedValue || 0}`;
      } else {
        action = 'Status Changed';
        details = `Status transitioned from "${currentLead.status}" to "${updatedLead.status}"`;
      }
    } else if (currentLead.estimatedValue !== updatedLead.estimatedValue) {
      details = `Estimated value changed from $${currentLead.estimatedValue || 0} to $${updatedLead.estimatedValue || 0}`;
    }

    await db.insert(leadActivities).values({
      leadId: updatedLead.id,
      leadName: updatedLead.name,
      action,
      details,
    }).catch(err => console.error('Failed to log lead activity:', err.message));
  }

  return updatedLead;
};

// ─── deleteLeadById ───────────────────────────────────────────────────────────
const deleteLeadById = async (id, userId) => {
  const rows = await db.delete(leads)
    .where(and(eq(leads.id, parseInt(id, 10)), eq(leads.userId, userId)))
    .returning();
  return rows[0] || null;
};

// ─── searchLeads ──────────────────────────────────────────────────────────────
const searchLeads = async (q, userId) => {
  if (!q || q.trim() === '') return [];

  const pattern = `%${q.trim()}%`;
  
  let searchCond = or(
    ilike(leads.name, pattern),
    ilike(leads.email, pattern),
    ilike(leads.company, pattern),
    ilike(leads.phone, pattern)
  );

  if (userId) {
    searchCond = and(searchCond, eq(leads.userId, userId));
  }

  return db.select().from(leads)
    .where(searchCond)
    .orderBy(desc(leads.createdAt));
};

// ─── getLeadStats ─────────────────────────────────────────────────────────────
const getLeadStats = async ({ timeframe = '30d', startDate, endDate, userId } = {}) => {
  // Parsing date ranges
  let start = null;
  let end = new Date();

  if (timeframe === '7d') {
    start = new Date();
    start.setDate(start.getDate() - 7);
  } else if (timeframe === '30d') {
    start = new Date();
    start.setDate(start.getDate() - 30);
  } else if (timeframe === '90d') {
    start = new Date();
    start.setDate(start.getDate() - 90);
  } else if (timeframe === '12m') {
    start = new Date();
    start.setMonth(start.getMonth() - 12);
  } else if (timeframe === 'custom') {
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);
  }

  // Calculate previous interval bounds for comparisons
  let prevStart = null;
  let prevEnd = null;
  if (start) {
    const diff = end.getTime() - start.getTime();
    prevEnd = new Date(start.getTime());
    prevStart = new Date(start.getTime() - diff);
  } else {
    // Default to last 30 days comparison if start is null (all-time)
    start = new Date('2000-01-01'); // Treat all-time as very early start
    prevEnd = new Date();
    prevEnd.setDate(prevEnd.getDate() - 30);
    prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 60);
  }

  // Build where conditions
  let currentRangeCond = and(
    sql`${leads.createdAt} >= ${start}`,
    sql`${leads.createdAt} <= ${end}`
  );

  let prevRangeCond = and(
    sql`${leads.createdAt} >= ${prevStart}`,
    sql`${leads.createdAt} <= ${prevEnd}`
  );

  if (userId) {
    currentRangeCond = and(currentRangeCond, eq(leads.userId, userId));
    prevRangeCond = and(prevRangeCond, eq(leads.userId, userId));
  }

  // Compile recent activities query with user scoping
  let activitiesQuery = db.select({
    id: leadActivities.id,
    leadId: leadActivities.leadId,
    leadName: leadActivities.leadName,
    action: leadActivities.action,
    details: leadActivities.details,
    createdAt: leadActivities.createdAt
  }).from(leadActivities);

  if (userId) {
    activitiesQuery = activitiesQuery
      .innerJoin(leads, eq(leadActivities.leadId, leads.id))
      .where(eq(leads.userId, userId));
  }

  activitiesQuery = activitiesQuery.orderBy(desc(leadActivities.createdAt)).limit(8);

  // Promise.all to fetch everything in parallel
  const [
    currentTotalRes,
    prevTotalRes,
    currentWonRes,
    prevWonRes,
    currentLostRes,
    prevLostRes,
    statusRes,
    monthlyIntakeRes,
    sourceRes,
    revenueRes,
    activityRes,
    companyRes,
    dailyTrendRes
  ] = await Promise.all([
    // KPI totals
    db.select({ count: sql`count(*)` }).from(leads).where(currentRangeCond),
    db.select({ count: sql`count(*)` }).from(leads).where(prevRangeCond),

    // Closed Won
    db.select({ count: sql`count(*)` }).from(leads).where(and(eq(leads.status, 'Converted'), currentRangeCond)),
    db.select({ count: sql`count(*)` }).from(leads).where(and(eq(leads.status, 'Converted'), prevRangeCond)),

    // Closed Lost
    db.select({ count: sql`count(*)` }).from(leads).where(and(eq(leads.status, 'Lost'), currentRangeCond)),
    db.select({ count: sql`count(*)` }).from(leads).where(and(eq(leads.status, 'Lost'), prevRangeCond)),

    // Status Distribution
    db.select({ status: leads.status, count: sql`count(*)` }).from(leads).where(currentRangeCond).groupBy(leads.status),

    // Monthly Intake (added leads grouped by month)
    db.select({
      month: sql`to_char(${leads.createdAt}, 'YYYY-MM')`,
      count: sql`count(*)`
    }).from(leads).where(currentRangeCond).groupBy(sql`to_char(${leads.createdAt}, 'YYYY-MM')`).orderBy(sql`to_char(${leads.createdAt}, 'YYYY-MM')`),

    // Source Distribution
    db.select({ source: leads.source, count: sql`count(*)` }).from(leads).where(currentRangeCond).groupBy(leads.source),

    // Revenue Forecast
    db.select({
      month: sql`to_char(${leads.createdAt}, 'YYYY-MM')`,
      status: leads.status,
      value: sql`sum(${leads.estimatedValue})`
    }).from(leads).where(currentRangeCond).groupBy(sql`to_char(${leads.createdAt}, 'YYYY-MM')`, leads.status),

    // Recent Activity
    activitiesQuery,

    // Top Companies
    db.select({
      company: leads.company,
      count: sql`count(*)`,
      qualified: sql`sum(case when ${leads.status} = 'Qualified' then 1 else 0 end)`,
      converted: sql`sum(case when ${leads.status} = 'Converted' then 1 else 0 end)`
    }).from(leads).where(currentRangeCond).groupBy(leads.company).orderBy(sql`count(*) desc`).limit(5),

    // Daily trends for sparklines & conversion trend chart
    db.select({
      date: sql`to_char(${leads.createdAt}, 'YYYY-MM-DD')`,
      total: sql`count(*)`,
      converted: sql`sum(case when ${leads.status} = 'Converted' then 1 else 0 end)`,
      lost: sql`sum(case when ${leads.status} = 'Lost' then 1 else 0 end)`
    }).from(leads).where(currentRangeCond).groupBy(sql`to_char(${leads.createdAt}, 'YYYY-MM-DD')`).orderBy(sql`to_char(${leads.createdAt}, 'YYYY-MM-DD')`)
  ]);

  const currentTotal = parseInt(currentTotalRes[0]?.count || 0, 10);
  const prevTotal = parseInt(prevTotalRes[0]?.count || 0, 10);

  const currentWon = parseInt(currentWonRes[0]?.count || 0, 10);
  const prevWon = parseInt(prevWonRes[0]?.count || 0, 10);

  const currentLost = parseInt(currentLostRes[0]?.count || 0, 10);
  const prevLost = parseInt(prevLostRes[0]?.count || 0, 10);

  // Conversion rates
  const currentConvRate = currentTotal > 0 ? (currentWon / currentTotal) * 100 : 0;
  const prevConvRate = prevTotal > 0 ? (prevWon / prevTotal) * 100 : 0;

  // Growth calculations
  const calcGrowth = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return parseFloat(((curr - prev) / prev * 100).toFixed(1));
  };

  const totalGrowth = calcGrowth(currentTotal, prevTotal);
  const wonGrowth = calcGrowth(currentWon, prevWon);
  const lostGrowth = calcGrowth(currentLost, prevLost);
  const convRateGrowth = parseFloat((currentConvRate - prevConvRate).toFixed(1));

  // Funnel calculations
  // New -> Contacted -> Qualified -> Converted
  const statusCounts = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 };
  statusRes.forEach(r => {
    if (r.status in statusCounts) {
      statusCounts[r.status] = parseInt(r.count, 10);
    }
  });

  // Funnel Cumulative Steps
  const newStage = currentTotal - statusCounts.Lost; // All leads that started
  const contactedStage = statusCounts.Contacted + statusCounts.Qualified + statusCounts.Converted;
  const qualifiedStage = statusCounts.Qualified + statusCounts.Converted;
  const convertedStage = statusCounts.Converted;

  const getPercentage = (val, base) => base > 0 ? Math.round((val / base) * 100) : 0;

  const funnel = [
    { stage: 'New', count: newStage, conversion: 100, dropoff: 0 },
    { stage: 'Contacted', count: contactedStage, conversion: getPercentage(contactedStage, newStage), dropoff: 100 - getPercentage(contactedStage, newStage) },
    { stage: 'Qualified', count: qualifiedStage, conversion: getPercentage(qualifiedStage, contactedStage), dropoff: 100 - getPercentage(qualifiedStage, contactedStage) },
    { stage: 'Converted', count: convertedStage, conversion: getPercentage(convertedStage, qualifiedStage), dropoff: 100 - getPercentage(convertedStage, qualifiedStage) }
  ];

  // Monthly revenue forecast mapping
  const revenueForecastMap = {};
  revenueRes.forEach(r => {
    const m = r.month || 'Other';
    if (!revenueForecastMap[m]) {
      revenueForecastMap[m] = { month: m, Qualified: 0, Converted: 0, total: 0 };
    }
    const val = parseInt(r.value || 0, 10);
    if (r.status === 'Qualified') {
      revenueForecastMap[m].Qualified += val;
    } else if (r.status === 'Converted') {
      revenueForecastMap[m].Converted += val;
    }
    revenueForecastMap[m].total += val;
  });
  const revenueForecast = Object.values(revenueForecastMap).sort((a, b) => a.month.localeCompare(b.month));

  // Conversion Trend chart monthly data
  const conversionTrendMap = {};
  dailyTrendRes.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!conversionTrendMap[month]) {
      conversionTrendMap[month] = { month, total: 0, converted: 0 };
    }
    conversionTrendMap[month].total += parseInt(t.total || 0, 10);
    conversionTrendMap[month].converted += parseInt(t.converted || 0, 10);
  });
  const conversionTrend = Object.values(conversionTrendMap).map(m => ({
    month: m.month,
    conversionRate: m.total > 0 ? parseFloat(((m.converted / m.total) * 100).toFixed(1)) : 0
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Sparkline arrays (just counts over time)
  const opportunitiesSparkline = dailyTrendRes.map(t => parseInt(t.total || 0, 10));
  const wonSparkline = dailyTrendRes.map(t => parseInt(t.converted || 0, 10));
  const lostSparkline = dailyTrendRes.map(t => parseInt(t.lost || 0, 10));

  // Status Distribution Data mapping
  const statusDistribution = Object.keys(statusCounts).map(k => ({
    name: k,
    value: statusCounts[k],
    percentage: currentTotal > 0 ? parseFloat(((statusCounts[k] / currentTotal) * 100).toFixed(1)) : 0
  }));

  // Source Distribution mapping
  const sourceDistribution = sourceRes.map(r => ({
    source: r.source || 'Direct',
    count: parseInt(r.count || 0, 10),
    percentage: currentTotal > 0 ? parseFloat(((parseInt(r.count, 10) / currentTotal) * 100).toFixed(1)) : 0
  }));

  // Monthly growth mapping
  const monthlyGrowth = monthlyIntakeRes.map((r, idx, arr) => {
    const prevCount = idx > 0 ? arr[idx-1].count : 0;
    return {
      name: r.month,
      count: parseInt(r.count || 0, 10),
      growthMoM: prevCount > 0 ? parseFloat((((parseInt(r.count, 10) - prevCount) / prevCount) * 100).toFixed(1)) : 0
    };
  });

  return {
    kpis: {
      total: { value: currentTotal, growth: totalGrowth },
      won: { value: currentWon, growth: wonGrowth },
      lost: { value: currentLost, growth: lostGrowth },
      conversionRate: { value: parseFloat(currentConvRate.toFixed(1)), growth: convRateGrowth }
    },
    sparklines: {
      opportunities: opportunitiesSparkline.length ? opportunitiesSparkline : [0, 0, 0],
      won: wonSparkline.length ? wonSparkline : [0, 0, 0],
      lost: lostSparkline.length ? lostSparkline : [0, 0, 0]
    },
    statusDistribution,
    monthlyGrowth,
    funnel,
    conversionTrend,
    sourceDistribution,
    revenueForecast,
    recentActivities: activityRes.map(a => ({
      id: a.id,
      leadId: a.leadId,
      leadName: a.leadName,
      action: a.action,
      details: a.details,
      createdAt: a.createdAt
    })),
    topCompanies: companyRes.map(c => ({
      company: c.company || 'Unknown',
      count: parseInt(c.count || 0, 10),
      qualified: parseInt(c.qualified || 0, 10),
      converted: parseInt(c.converted || 0, 10)
    }))
  };
};

// ─── seedDemoLeads ────────────────────────────────────────────────────────────
const seedDemoLeads = async (userId) => {
  const demoLeads = [
    { name: 'Sarah Johnson',     email: 'sarah.johnson@techcorp.io',    phone: '+1-415-555-0101', company: 'TechCorp Solutions',  status: 'Converted', source: 'Referral',     gender: 'Female', estimatedValue: 18500, notes: 'Closed Q1 deal. Exceptional ROI.', userId },
    { name: 'Michael Chen',      email: 'mchen@globalventures.com',     phone: '+1-212-555-0182', company: 'Global Ventures',     status: 'Qualified',  source: 'Web',          gender: 'Male',   estimatedValue: 32000, notes: 'Decision maker confirmed. Budget approved.', userId },
    { name: 'Priya Patel',       email: 'priya.p@innovateai.in',        phone: '+91-98-5551-0234', company: 'InnovateAI',         status: 'Contacted',  source: 'Cold-Call',    gender: 'Female', estimatedValue: 9800,  notes: 'Intro call done. Following up next week.', userId },
    { name: 'James Whitmore',    email: 'jwhitmore@neonedge.co',        phone: '+44-20-5550-0311', company: 'NeonEdge Digital',   status: 'New',        source: 'Social Media', gender: 'Male',   estimatedValue: 5000,  notes: 'Signed up via LinkedIn ad.', userId },
    { name: 'Emily Rodriguez',   email: 'emily.r@brightpath.com',       phone: '+1-305-555-0421', company: 'BrightPath LLC',     status: 'Lost',       source: 'Web',          gender: 'Female', estimatedValue: 0,     notes: 'Went with competitor. Price point issue.', userId },
    { name: 'David Kim',         email: 'd.kim@fusionworks.kr',         phone: '+82-2-5550-0512', company: 'FusionWorks Korea',  status: 'Qualified',  source: 'Partner',      gender: 'Male',   estimatedValue: 47000, notes: 'Enterprise deal. Needs legal review.', userId },
    { name: 'Aisha Nwosu',       email: 'aisha.n@crescenttech.ng',      phone: '+234-80-5550-0601', company: 'CrescentTech',     status: 'Contacted',  source: 'Referral',     gender: 'Female', estimatedValue: 12000, notes: 'Referred by David Kim. Very interested.', userId },
    { name: 'Lucas Mendes',      email: 'lmendes@solarfluxbr.com',      phone: '+55-11-5550-0711', company: 'SolarFlux Brasil',  status: 'New',        source: 'Web',          gender: 'Male',   estimatedValue: 7500,  notes: 'Downloaded whitepaper. Potential upsell.', userId },
    { name: 'Sophie Laurent',    email: 's.laurent@artisancrm.fr',      phone: '+33-1-5550-0821', company: 'Artisan CRM Paris',  status: 'Converted', source: 'Cold-Call',    gender: 'Female', estimatedValue: 22000, notes: 'Signed 12-month contract.', userId },
    { name: 'Omar Al-Rashid',    email: 'omar.ar@pinnacleae.ae',        phone: '+971-4-5550-0911', company: 'Pinnacle UAE',      status: 'Qualified',  source: 'Social Media', gender: 'Male',   estimatedValue: 55000, notes: 'High-value prospect. Series B funded.', userId },
    { name: 'Natalie Berg',      email: 'nberg@nordicsaas.se',          phone: '+46-8-5550-1012', company: 'Nordic SaaS AB',    status: 'Contacted',  source: 'Web',          gender: 'Female', estimatedValue: 14500, notes: 'Demo scheduled for next Thursday.', userId },
    { name: 'Carlos Vega',       email: 'c.vega@deltamexgroup.mx',      phone: '+52-55-5550-1102', company: 'Delta Mex Group',   status: 'Lost',       source: 'Partner',      gender: 'Male',   estimatedValue: 0,     notes: 'Budget frozen for Q3. May revisit.', userId },
    { name: 'Yuki Tanaka',       email: 'y.tanaka@nexusprojp.jp',       phone: '+81-3-5550-1211', company: 'Nexus Proj Japan',  status: 'New',        source: 'Referral',     gender: 'Female', estimatedValue: 8200,  notes: 'Highly recommended by existing client.', userId },
    { name: 'Ryan O\'Brien',     email: 'robrien@velocityde.de',        phone: '+49-30-5550-1312', company: 'Velocity Digital',  status: 'Converted', source: 'Web',          gender: 'Male',   estimatedValue: 19800, notes: 'Fast close — 3 day sales cycle.', userId },
    { name: 'Amara Diallo',      email: 'a.diallo@sahelagrosnl.nl',     phone: '+31-20-5550-1401', company: 'Sahel Agros BV',    status: 'Qualified',  source: 'Cold-Call',    gender: 'Female', estimatedValue: 28000, notes: 'Agriculture vertical. Strong fit.', userId },
    { name: 'Ethan Moore',       email: 'ethan.m@clarkanalytics.us',    phone: '+1-737-555-1510', company: 'Clark Analytics',   status: 'Contacted',  source: 'Social Media', gender: 'Male',   estimatedValue: 11000, notes: 'Seen our webinar. Warm lead.', userId },
    { name: 'Isabella Rossi',    email: 'i.rossi@terrafolioit.it',      phone: '+39-02-5550-1602', company: 'Terrafoglio Italia', status: 'New',       source: 'Web',          gender: 'Female', estimatedValue: 6500,  notes: 'Requested pricing info via contact form.', userId },
    { name: 'Ben Okafor',        email: 'b.okafor@apexlogisticsgh.com', phone: '+233-20-5550-1701', company: 'Apex Logistics GH', status: 'Lost',     source: 'Partner',      gender: 'Male',   estimatedValue: 0,     notes: 'Chose in-house solution.', userId },
    { name: 'Fiona Walsh',       email: 'fwalsh@greenleafie.ie',        phone: '+353-1-5550-1811', company: 'GreenLeaf Ireland', status: 'Contacted', source: 'Referral',     gender: 'Female', estimatedValue: 16000, notes: 'Second call scheduled. Strong interest.', userId },
    { name: 'Arjun Sharma',      email: 'arjun.s@quantumspin.in',       phone: '+91-98-5551-1902', company: 'QuantumSpin Tech',  status: 'Qualified',  source: 'Web',          gender: 'Male',   estimatedValue: 39000, notes: 'CTO-level engagement. POC approved.', userId },
  ];

  // Insert only if demo account has no leads yet
  const existing = await db.select({ count: sql`count(*)` }).from(leads).where(eq(leads.userId, userId));
  const count = parseInt(existing[0]?.count || 0, 10);
  if (count > 0) return; // Already seeded

  for (const lead of demoLeads) {
    await db.insert(leads).values(lead).onConflictDoNothing();
  }
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
  seedDemoLeads,
};

