const ApiError = require('../utils/ApiError');

/**
 * errorHandler
 * --------------------------------------------------
 * Express error-handling middleware (4 arguments).
 *
 * Handles:
 *  - ApiError instances        → use the attached statusCode
 *  - Mongoose CastError        → 400 (bad ObjectId / type)
 *  - Mongoose duplicate key    → 400 (code 11000)
 *  - Mongoose ValidationError  → 400 (schema validation)
 *  - Everything else           → 500 Internal Server Error
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('ERROR:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Custom ApiError ───────────────────────────────
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ── Mongoose CastError (bad ObjectId, etc.) ───────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose Duplicate Key Error ──────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for field(s): ${field}. Please use another value`;
  }

  // ── Mongoose Validation Error ─────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
