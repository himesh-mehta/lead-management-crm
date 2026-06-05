const Lead = require('../models/Lead');

// ─── GET /api/leads ───────────────────────────────────────────────────────────
/**
 * @desc    Get all leads (paginated, filterable, sortable)
 * @route   GET /api/leads?page=1&limit=10&status=New&sort=created_at
 */
const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = 'created_at' } = req.query;

    const result = await Lead.findAllLeads({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status: status || undefined,
      sort,
    });

    res.status(200).json({
      leads: result.leads,
      total: result.pagination.total,
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
      limit: result.pagination.limit,
    });
  } catch (err) {
    console.error('[getLeads]', err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────
/**
 * @desc    Get single lead by ID
 * @route   GET /api/leads/:id
 */
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findLeadById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: `Lead with id ${req.params.id} not found` });
    }

    res.status(200).json({ lead });
  } catch (err) {
    console.error('[getLead]', err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── POST /api/leads ──────────────────────────────────────────────────────────
/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @body    { name, email, phone, company, status?, notes? }
 */
const createLead = async (req, res) => {
  try {
    const lead = await Lead.createLead(req.body);
    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (err) {
    console.error('[createLead]', err.message);

    const dbErrorCode = err.code || err.driverError?.code;
    if (
      dbErrorCode === '23505' || 
      err.message.includes('unique constraint') || 
      err.message.includes('leads_email_unique')
    ) {
      return res.status(400).json({ message: 'A prospect with this email address is already registered' });
    }

    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── PUT /api/leads/:id ───────────────────────────────────────────────────────
/**
 * @desc    Update a lead by ID (partial update supported)
 * @route   PUT /api/leads/:id
 * @body    Any subset of { name, email, phone, company, status, notes }
 */
const updateLead = async (req, res) => {
  try {
    const updated = await Lead.updateLeadById(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: `Lead with id ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Lead updated successfully', lead: updated });
  } catch (err) {
    console.error('[updateLead]', err.message);

    const dbErrorCode = err.code || err.driverError?.code;
    if (
      dbErrorCode === '23505' || 
      err.message.includes('unique constraint') || 
      err.message.includes('leads_email_unique')
    ) {
      return res.status(400).json({ message: 'A prospect with this email address is already registered' });
    }

    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────
/**
 * @desc    Delete a lead by ID
 * @route   DELETE /api/leads/:id
 */
const deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.deleteLeadById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: `Lead with id ${req.params.id} not found` });
    }

    res.status(200).json({ message: 'Lead deleted successfully', lead: deleted });
  } catch (err) {
    console.error('[deleteLead]', err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── GET /api/leads/search?q=term ────────────────────────────────────────────
/**
 * @desc    Search leads by name, email, or company (case-insensitive)
 * @route   GET /api/leads/search?q=acme
 */
const searchLeads = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query param "q" is required' });
    }

    const leads = await Lead.searchLeads(q);
    res.status(200).json({ leads, total: leads.length });
  } catch (err) {
    console.error('[searchLeads]', err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── GET /api/leads/stats ─────────────────────────────────────────────────────
/**
 * @desc    Get pipeline statistics
 * @route   GET /api/leads/stats
 */
const getStats = async (req, res) => {
  try {
    const { timeframe, startDate, endDate } = req.query;
    const stats = await Lead.getLeadStats({ timeframe, startDate, endDate });
    res.status(200).json({ stats });
  } catch (err) {
    console.error('[getStats]', err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  searchLeads,
  getStats,
};
