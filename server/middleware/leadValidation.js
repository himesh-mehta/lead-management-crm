const { body, param, query } = require('express-validator');

// Valid status values — mirrors the CHECK constraint in PostgreSQL
const VALID_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

// ─── createLead rules ─────────────────────────────────────────────────────────
const createLeadRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name must be 255 characters or fewer'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .isLength({ max: 50 }).withMessage('Phone must be 50 characters or fewer'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company is required')
    .isLength({ max: 255 }).withMessage('Company must be 255 characters or fewer'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
];

// ─── updateLead rules ─────────────────────────────────────────────────────────
// All fields optional — but if provided, must be valid
const updateLeadRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('Lead ID must be a positive integer'),

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 255 }).withMessage('Name must be 255 characters or fewer'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Phone cannot be empty')
    .isLength({ max: 50 }).withMessage('Phone must be 50 characters or fewer'),

  body('company')
    .optional()
    .trim()
    .notEmpty().withMessage('Company cannot be empty')
    .isLength({ max: 255 }).withMessage('Company must be 255 characters or fewer'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
];

// ─── ID param rule (for getLead / deleteLead) ─────────────────────────────────
const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('Lead ID must be a positive integer'),
];

// ─── Search query rule ────────────────────────────────────────────────────────
const searchRules = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query "q" is required')
    .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
];

module.exports = {
  createLeadRules,
  updateLeadRules,
  idParamRules,
  searchRules,
};
