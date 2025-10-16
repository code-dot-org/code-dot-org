const pinoLogger = require('pino');

const nodeEnvironment = process.env.NODE_ENV || 'development';

const logger = defaultConfig =>
  pinoLogger({
    ...defaultConfig,
    level: nodeEnvironment === 'production' ? 'info' : 'debug',
  });

module.exports = {
  logger,
};
