const express = require('express');
const router = express.Router();

const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  searchLeads,
  getStats,
} = require('../controllers/leadController');

const validate = require('../middleware/validate');
const {
  createLeadRules,
  updateLeadRules,
  idParamRules,
  searchRules,
} = require('../middleware/leadValidation');

// ─── Order matters in Express ─────────────────────────────────────────────────
// Static segments (/search, /stats) MUST come before dynamic segments (/:id)

router.get('/search', searchRules, validate, searchLeads);   // GET  /api/leads/search?q=term
router.get('/stats',  getStats);                             // GET  /api/leads/stats

router.get('/',       getLeads);                             // GET  /api/leads
router.get('/:id',    idParamRules, validate, getLead);      // GET  /api/leads/:id

router.post('/',      createLeadRules, validate, createLead);          // POST   /api/leads
router.put('/:id',    updateLeadRules, validate, updateLead);          // PUT    /api/leads/:id
router.delete('/:id', idParamRules,   validate, deleteLead);           // DELETE /api/leads/:id

module.exports = router;
