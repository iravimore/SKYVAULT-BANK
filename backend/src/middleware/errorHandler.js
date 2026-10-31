const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack });
  }

  res.status(statusCode).json({
    error: err.isOperational ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
