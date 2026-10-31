const app = require('./app');
const logger = require('./utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`SkyVault Bank API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message, stack: err.stack });
});

module.exports = server;
