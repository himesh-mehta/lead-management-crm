/**
 * Global error-handling middleware.
 * Must be registered LAST in Express (after all routes).
 * Express identifies it as an error handler because it has 4 params.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error in development, just the message in production
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
