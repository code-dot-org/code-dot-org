// Passed via karma.conf.js using the client.KARMA_CLI_ARGS property.
//
// For example running `karma start --levelType=maze` will set
// KARMA_CLI_ARGS.levelType = 'maze'.

const KARMA_CLI_ARGS = window.__karma__.config.KARMA_CLI_ARGS;
module.exports = KARMA_CLI_ARGS;
