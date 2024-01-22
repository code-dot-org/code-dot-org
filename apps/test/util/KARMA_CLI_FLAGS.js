// Passed via karma.conf.js using the client.KARMA_CLI_FLAGS property.
//
// For example running `karma start --levelType=maze` will set
// KARMA_CLI_FLAGS.levelType = 'maze'.

const KARMA_CLI_FLAGS = window.__karma__.config.KARMA_CLI_FLAGS;
module.exports = KARMA_CLI_FLAGS;
