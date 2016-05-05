/**
 * A set of reducers that are used across all of our apps
 */

var runState = require('./runState');
var levelProperties = require('./levelProperties');

module.exports = {
  runState: runState.default,
  level: levelProperties.default
};
