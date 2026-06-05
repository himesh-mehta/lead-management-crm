const { validationResult } = require('express-validator');

/**
 * Generic validation runner middleware.
 * Place this AFTER your express-validator check() chains in a route.
 * If there are errors, responds with 422 and a structured error list.
 * Otherwise calls next() to proceed to the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
