// Minimal Jest config for running the schema snapshot update script.
// Skips locale/dom setup files that require a full build.
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/test/unit/aiGateway/updateAiGatewaySchemaSnapshots.ts'],
  setupFiles: [],
  setupFilesAfterEnv: [],
};
